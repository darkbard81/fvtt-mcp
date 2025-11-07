# Foundry MCP Relay

간단한 Express 서버로 Foundry VTT와 MCP(Model Context Protocol) 사이에서 이벤트를 중계하는 Node.js/TypeScript 프로젝트입니다.

## 요구 사항

- Node.js 20 이상
- npm 10 이상

## 설치

```bash
npm install
```

## 환경 변수

`.env.example`이 없다면 아래 값을 참고해 `.env`를 작성하세요.

```txt
PORT=3000
FOUNDRY_URL=http://localhost:30000
MCP_SERVER_URL=http://localhost:4000
```

필요한 값이 더 있다면 `.env`에 추가하고 README도 함께 업데이트해주세요.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | `loader-register.mjs`를 통해 MCP 로더를 등록한 뒤 서버를 개발 모드로 실행합니다. |
| `npm run build` | TypeScript 파일을 `dist/`로 트랜스파일합니다. |
| `npm start` | 빌드 결과물(`dist/server.js`)을 실행해 프로덕션 모드로 서버를 띄웁니다. |

## 개발 흐름

1. `.env`를 준비합니다.
2. `npm run dev`로 서버를 실행하고 Foundry 및 MCP 서버와 연동을 확인합니다.
3. 변경 사항은 `npm run build`로 검증한 뒤 배포 브랜치에 병합합니다.

## 디렉터리 구조

```txt
├── src/               # TypeScript 소스
├── dist/              # 빌드 산출물 (git ignore)
├── loader-register.mjs
└── AGENTS.md          # MCP 관련 에이전트 설정 문서
```

## 테스트 & 품질

- 타입 검사를 위해 빌드 전에 `tsc`가 자동 실행됩니다.
- 필요 시 ESLint/테스트 도구를 추가해 품질 체크 단계를 확장할 수 있습니다.

## To do Oauth

- Keycloak: 가장 강력하고 완전한 기능, 하지만 좀 무거워요 (Java 기반)
- Ory Hydra: 경량이면서 OAuth 2.0/OIDC 표준 완벽 지원
- Authelia: 가볍고 설정이 간단한 인증 서버
- OAuth2 Proxy: 기존 앱 앞단에 OAuth 레이어 추가

```txt
사용자 → OAuth2 Proxy → 인증 확인 → 백엔드 앱
         ↓ (인증 안됨)
         OAuth Provider (Google, GitHub 등)
```
