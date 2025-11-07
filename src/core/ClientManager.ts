// src/core/ClientManager.ts
import { WebSocket } from "ws";
import { log } from "../utils/logger.js";
import { Client } from "../core/Client.js";

type MessageHandler = (client: Client, message: any) => void;

const INSTANCE_ID = process.env.FLY_ALLOC_ID || 'local';
const CLIENT_EXPIRY = 60 * 60 * 2; // 2 hours expiry for Redis keys
const isMemoryStore = process.env.DB_TYPE === 'memory';

export class ClientManager {
  private static clients = new Map<string, Client>();
  private static tokenGroups = new Map<string, Set<string>>(); 
  private static messageHandlers = new Map<string, MessageHandler[]>();

  /**
   * Add a new client to the manager
   */
  static async addClient(
    ws: WebSocket, 
    id: string, 
    token: string, 
    worldId: string | null, 
    worldTitle: string | null,
    foundryVersion: string | null = null,
    systemId: string | null = null,
    systemTitle: string | null = null,
    systemVersion: string | null = null,
    customName: string | null = null
  ): Promise<Client | null> {
    // Check if client already exists
    if (this.clients.has(id)) {
      log.warn(`Client ${id} already exists, rejecting connection`);
      ws.close(4004, "Client ID already connected");
      return null;
    }

    // Create new client
    const client = new Client(ws, id, token, worldId, worldTitle, foundryVersion, systemId, systemTitle, systemVersion, customName);
    this.clients.set(id, client);

    // Add client to token group
    if (!this.tokenGroups.has(token)) {
      this.tokenGroups.set(token, new Set());
    }
    this.tokenGroups.get(token)?.add(id);

    const tokenTrunicated = `${token.substring(0, 8)}...`;
    log.info(`Client ${id} connected with token ${tokenTrunicated}`);
    return client;
  }

  /**
   * Remove a client from the manager
   */
  static async removeClient(id: string): Promise<void> {
    const client = this.clients.get(id);
    if (client) {
      const token = client.getApiKey();
      
      // Clean up local state
      this.clients.delete(id);
      this.tokenGroups.get(token)?.delete(id);
      if (this.tokenGroups.get(token)?.size === 0) {
        this.tokenGroups.delete(token);
      }
      
      log.info(`Client ${id} disconnected`);
    }
  }

  /**
   * Get a client by ID
   */
  static async getClient(id: string): Promise<Client | null> {
    // First check local clients
    const client = this.clients.get(id);
    if (client) {
      return client;
    }
    return null;
  }

//   /**
//    * Get the instance ID for a client by ID
//    */
//   static async getClientInstance(id: string): Promise<string | null> {
//     try {
//       const redis = getRedisClient();
//       if (redis) {
//         return await redis.get(`client:id:${id}:instance`);
//       } else {
//         return null;
//       }
//     } catch (error) {
//       log.error(`Error getting client instance from Redis: ${error}`);
//       return null;
//     }
//   }

//   /**
//    * Get the instance ID for an API token
//    */
//   static async getInstanceForToken(token: string): Promise<string | null> {
//     try {
//       const redis = getRedisClient();
//       if (redis) {
//         return await redis.get(`client:${token}:instance`);
//       } else {
//         return null;
//       }
//     } catch (error) {
//       log.error(`Error getting instance for token from Redis: ${error}`);
//       return null;
//     }
//   }

//   /**
//    * Get the instance ID for an API key
//    */
//   static async getInstanceForApiKey(apiKey: string): Promise<string | null> {
//     try {
//       const redis = getRedisClient();
//       if (redis) {
//         // Directly look up the instance for this API key
//         return await redis.get(`apikey:${apiKey}:instance`);
//       }
//       return null;
//     } catch (error) {
//       log.error(`Error getting instance for API key from Redis: ${error}`);
//       return null;
//     }
//   }

  /**
   * Get all connected clients for an API key
   */
  static async getConnectedClients(apiKey: string): Promise<string[]> {
    const localClients = Array.from(this.tokenGroups.get(apiKey) || [])
      .filter(id => this.clients.has(id) && this.clients.get(id)!.isAlive())
      .map(id => id); // Just return the client IDs
    
    // In a distributed setup, we'd need to query other instances
    // For now, just return local clients
    return localClients;
  }

  /**
   * Update client's last seen timestamp
   */
  static updateClientLastSeen(id: string): void {
    const client = this.clients.get(id);
    if (client) {
      client.updateLastSeen();
    }
  }

  /**
   * Broadcast a message to all clients in the same token group
   */
  static async broadcastToGroup(senderId: string, message: any): Promise<void> {
    const sender = this.clients.get(senderId);
    if (!sender) return;

    const token = sender.getApiKey();
    
    // Broadcast to local clients
    const groupClients = this.tokenGroups.get(token);
    if (groupClients) {
      for (const clientId of groupClients) {
        if (clientId !== senderId) {
          const client = this.clients.get(clientId);
          if (client && client.isAlive()) {
            client.send(message);
          }
        }
      }
    }
    
    // In a distributed setup with pub/sub, we'd publish to a Redis channel here
    // For Fly.io private network, we'd need to implement a pub/sub system
    // This is beyond the scope of this implementation
  }

  /**
   * Register a handler for a specific message type
   */
  static onMessageType(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * Process an incoming message
   */
  static handleIncomingMessage(clientId: string, message: any): void {
    try {
      const client = this.clients.get(clientId);
      if (!client) return;

      // Update last seen timestamp
      client.updateLastSeen();

      // Handle ping messages specially
      if (message.type === "ping") {
        client.send({ type: "pong" });
        return;
      }
      
      // Handle other message types with registered handlers
      if (message.type && this.messageHandlers.has(message.type)) {
        for (const handler of this.messageHandlers.get(message.type)!) {
          try {
            handler(client, message);
          } catch (handlerError) {
            log.error('Error in message handler', {
              clientId,
              messageType: message.type,
              requestId: message.requestId,
              error: handlerError instanceof Error ? {
                name: handlerError.name,
                message: handlerError.message,
                stack: handlerError.stack
              } : String(handlerError)
            });
          }
        }
        return;
      }

      // Broadcast other messages
      this.broadcastToGroup(clientId, message);
    } catch (error) {
      log.error('Error handling message', {
        clientId,
        messageType: message?.type,
        requestId: message?.requestId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error)
      });
    }
  }

  /**
   * Clean up inactive clients
   */
  static async cleanupInactiveClients(): Promise<void> {
    const toRemove: string[] = [];
    
    // Check all clients - only use isAlive() which now incorporates the grace period
    for (const [id, client] of this.clients.entries()) {
      if (!client.isAlive()) {
        toRemove.push(id);
      }
    }
    
    // Remove inactive clients
    for (const id of toRemove) {
      log.info(`Removing inactive client ${id}`);
      await this.removeClient(id);
    }
  }
}

export class WebSocketManager {
  // other properties...
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  // other methods...
  
  onMessageType(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  private onMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type && this.messageHandlers.has(data.type)) {
        this.messageHandlers.get(data.type)!(data);
      }
    } catch (error) {
      log.error('Error processing message', { error });
    }
  }
}