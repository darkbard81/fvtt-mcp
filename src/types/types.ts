/**
 * Log Message Level.
 */
export enum LogLevel {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  DEBUG = "debug",
}

/**
 * Supported Gemini TTS prebuilt voices.
 */
export enum VoiceActor {
    Achernar = 'Achernar',            // 여성: 부드럽고 차분함
    Aoede = 'Aoede',                  // 여성: 친근하고 대화체
    Autonoe = 'Autonoe',              // 여성: 명확하고 밝음
    Callirhoe = 'Callirhoe',          // 여성: 전문적이고 또렷함
    Despina = 'Despina',              // 여성: 따뜻하고 친근함
    Erinome = 'Erinome',              // 여성: 지적이고 차분함
    Gacrux = 'Gacrux',                // 여성: 성숙하고 침착함
    Kore = 'Kore',                    // 여성: 자신감 있고 열정적
    Laomedeia = 'Laomedeia',          // 여성: 탐구적이고 대화체
    Leda = 'Leda',                    // 여성: 차분하고 전문적
    Pulcherrima = 'Pulcherrima',      // 여성: 활기차고 젊은 느낌
    Sulafar = 'Sulafar',              // 여성: 따뜻함 (Sulafat으로도 표기)
    Vindemiatrix = 'Vindemiatrix',    // 여성: 부드럽고 온화함
    Zephyr = 'Zephyr',                // 여성: 활기차고 밝음

    Achird = 'Achird',                // 남성: 친근하고 젊은 느낌
    Algenib = 'Algenib',              // 남성: 거칠고 개성 있음
    Algieba = 'Algieba',              // 남성: 부드러운 영국식 억양 느낌
    Alnilam = 'Alnilam',              // 남성: 단호하고 명확함
    Charon = 'Charon',                // 남성: 깊고 신뢰감 있는 저음
    Enceladus = 'Enceladus',          // 남성: 부드럽고 숨소리가 섞인 톤
    Fenrir = 'Fenrir',                // 남성: 빠르고 열정적
    Iapetus = 'Iapetus',              // 남성: 굵고 힘찬 톤
    Orus = 'Orus',                    // 남성: 단호하고 신뢰감 있음
    Puck = 'Puck',                    // 남성: 장난기 있고 활기참
    Rasalgethi = 'Rasalgethi',        // 남성: 정보 전달에 적합
    Sadachbia = 'Sadachbia',          // 남성: 생동감 있고 활기참
    Sadaltager = 'Sadaltager',        // 남성: 지적이고 전문적
    Schedar = 'Schedar',              // 남성: 차분하고 균형 잡힘
    Umbriel = 'Umbriel',              // 남성: 차분하고 편안함
    Zubenelgenubi = 'Zubenelgenubi',  // 남성: 캐주얼하고 편안함
}

/**
 * Supported Gemini TTS style tones.
 */
export enum StyleTone {
    BattleCry = 'battle cry',
    Calm = 'calm',
    Coquettish = 'coquettish',
    Dramatic = 'dramatic',
    Formal = 'formal',
    Friendly = 'friendly',
    Heroic = 'heroic',
    Hitomi = 'hitomi',
    Narration = 'narration',
    Normal = 'according to script',
    Whisper = 'whisper',
}