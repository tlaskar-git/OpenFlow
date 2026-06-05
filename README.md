# OpenFlow

OpenFlow is a free, open-source Windows dictation app.

Hold or tap a shortcut, speak, and OpenFlow pastes the transcription into the app you were already using. It works in browsers, email, documents, chat apps, terminals, and anywhere else you can paste text.

OpenFlow runs locally on your PC. There is no OpenFlow server and no subscription for the app itself. You bring your own API key for transcription.

## What It Does

- Records from your microphone.
- Sends the audio to a Groq/OpenAI-compatible speech-to-text API.
- Optionally cleans the transcript with a chat model.
- Pastes the result into the active Windows app.
- Starts as a compact always-on-top control near the top of the screen.

## Why An API Key Is Needed

OpenFlow does not include a local speech model. Local models make the app much larger, slower to start, and more demanding on your computer.

By default, OpenFlow uses Groq because it is fast, OpenAI-compatible, easy to set up, and has free access for getting started. Groq's free access is limited by rate limits and supported models; heavier usage or higher limits may require a paid Groq plan. Current pricing and limits are controlled by Groq, not OpenFlow.

You can also point OpenFlow at another OpenAI-compatible provider if you prefer.

Useful links:

- [Groq pricing](https://groq.com/pricing)
- [Groq rate limits](https://console.groq.com/docs/rate-limits)
- [Groq speech-to-text docs](https://console.groq.com/docs/speech-to-text)

## Download

Fast launch, recommended:

[Download OpenFlow_v_0.1.0_Fast.7z](dist/OpenFlow_v_0.1.0_Fast.7z)

Extract once, then run `OpenFlow.exe` from the extracted folder. This avoids the startup delay from the single-file portable wrapper.

Fast archive size: `94,016,388` bytes

```text
37BE88C455CC06D7A8990C2491C281B4C2C3AE71E6265098FD65968C588DDDC9
```

Single-file portable, slower to start:

[Download OpenFlow_v_0.1.0_Portable.exe](dist/OpenFlow_v_0.1.0_Portable.exe)

Portable executable size: `94,391,948` bytes

```text
d54d1854839b72c2d698e7b7ae7d12b1092e74a57bb3b9e66e8cb7b680c68a9b
```

OpenFlow starts as a compact always-on-top control near the top of the screen. Use the arrow button to open the full settings view. The close button hides it to the tray; quit from the tray menu.

## First Run

1. Add your Groq or OpenAI-compatible API key.
2. Keep the default API base URL for Groq, or change it to another OpenAI-compatible provider.
3. Press `Ctrl+Alt+Space` to start recording.
4. Press `Ctrl+Alt+Space` again to transcribe, clean, and paste.

## Defaults

- API base URL: `https://api.groq.com/openai/v1`
- Transcription model: `whisper-large-v3`
- Cleanup model: `llama-3.1-8b-instant`
- Global shortcut: `Control+Alt+Space`

## Groq 403 Errors

If Groq returns a permission error, check the selected project in Groq Console and make sure these models are allowed:

- `whisper-large-v3` for transcription
- `llama-3.1-8b-instant` for cleanup

You can also change the model names in OpenFlow settings to models your Groq project allows.

If cleanup is blocked but transcription works, OpenFlow pastes the raw transcript and turns cleanup off locally.

## Build From Source

```powershell
npm install
npm run build
```

The single-file portable app and fast archive are written to `dist/`. No installer is required.

## Signed Builds

For public downloads, use a trusted Windows code-signing certificate. Unsigned Windows apps can show Microsoft Defender SmartScreen warnings until they build reputation.

```powershell
npm run build:signed
```

Set `CSC_LINK` and `CSC_KEY_PASSWORD` for certificate-backed release builds.
