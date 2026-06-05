const fields = {
  apiKey: document.querySelector("#apiKey"),
  apiBaseUrl: document.querySelector("#apiBaseUrl"),
  transcriptionModel: document.querySelector("#transcriptionModel"),
  cleanupModel: document.querySelector("#cleanupModel"),
  fallbackCleanupModel: document.querySelector("#fallbackCleanupModel"),
  shortcut: document.querySelector("#shortcut"),
  outputLanguage: document.querySelector("#outputLanguage"),
  customVocabulary: document.querySelector("#customVocabulary"),
  cleanupEnabled: document.querySelector("#cleanupEnabled")
};

const settingsForm = document.querySelector("#settingsForm");
const recordButton = document.querySelector("#recordButton");
const recordButtonLabel = document.querySelector("#recordButtonLabel");
const testProviderButton = document.querySelector("#testProviderButton");
const openDataFolderButton = document.querySelector("#openDataFolderButton");
const statusText = document.querySelector("#statusText");
const shortcutText = document.querySelector("#shortcutText");
const providerText = document.querySelector("#providerText");
const latestTranscript = document.querySelector("#latestTranscript");
const miniStatusText = document.querySelector("#miniStatusText");
const expandButton = document.querySelector("#expandButton");
const expandButtonIcon = document.querySelector("#expandButtonIcon");
const hideButton = document.querySelector("#hideButton");

let mediaRecorder;
let mediaStream;
let chunks = [];
let recordingStartedAt = 0;
let windowMode = "compact";

function setStatus(status) {
  const message = status?.message || "Ready";
  document.body.classList.toggle("is-error", status?.state === "error");
  statusText.textContent = message;
  miniStatusText.textContent = compactStatus(message);
}

function compactStatus(message) {
  if (!message) return "Ready";
  if (message.length <= 36) return message;
  return `${message.slice(0, 33)}...`;
}

function applyWindowMode(mode) {
  windowMode = mode === "expanded" ? "expanded" : "compact";
  document.body.classList.toggle("mode-expanded", windowMode === "expanded");
  document.body.classList.toggle("mode-compact", windowMode === "compact");
  expandButton.title = windowMode === "expanded" ? "Collapse" : "Open settings";
  expandButton.setAttribute("aria-label", expandButton.title);
  expandButtonIcon.classList.toggle("is-expanded", windowMode === "expanded");
}

function applySettings(settings) {
  fields.apiBaseUrl.value = settings.apiBaseUrl || "";
  fields.transcriptionModel.value = settings.transcriptionModel || "";
  fields.cleanupModel.value = settings.cleanupModel || "";
  fields.fallbackCleanupModel.value = settings.fallbackCleanupModel || "";
  fields.shortcut.value = settings.shortcut || "";
  fields.outputLanguage.value = settings.outputLanguage || "";
  fields.customVocabulary.value = settings.customVocabulary || "";
  fields.cleanupEnabled.checked = Boolean(settings.cleanupEnabled);
  fields.apiKey.placeholder = settings.apiKeyPresent ? "Saved. Enter a new key to replace it." : "Paste a Groq or OpenAI-compatible key";
  shortcutText.textContent = settings.shortcut || "Control+Alt+Space";
  providerText.textContent = providerLabel(settings.apiBaseUrl);
}

function providerLabel(value) {
  try {
    return new URL(value).host;
  } catch {
    return "OpenAI compatible";
  }
}

function formPayload(includeBlankKey = false) {
  const payload = {
    apiBaseUrl: fields.apiBaseUrl.value.trim(),
    transcriptionModel: fields.transcriptionModel.value.trim(),
    cleanupModel: fields.cleanupModel.value.trim(),
    fallbackCleanupModel: fields.fallbackCleanupModel.value.trim(),
    shortcut: fields.shortcut.value.trim(),
    outputLanguage: fields.outputLanguage.value.trim(),
    customVocabulary: fields.customVocabulary.value.trim(),
    cleanupEnabled: fields.cleanupEnabled.checked
  };

  const apiKey = fields.apiKey.value.trim();
  if (apiKey || includeBlankKey) {
    payload.apiKey = apiKey;
  }
  return payload;
}

async function startRecording() {
  if (mediaRecorder?.state === "recording") return;

  mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  });

  const preferredType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/webm";
  mediaRecorder = new MediaRecorder(mediaStream, { mimeType: preferredType });
  chunks = [];
  recordingStartedAt = Date.now();

  mediaRecorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  mediaRecorder.addEventListener("stop", submitRecording, { once: true });
  mediaRecorder.start();

  recordButton.classList.add("recording");
  recordButtonLabel.textContent = "Stop";
  setStatus({ state: "recording", message: "Recording..." });
}

function stopRecording() {
  if (mediaRecorder?.state !== "recording") return;
  mediaRecorder.stop();
  for (const track of mediaStream?.getTracks() || []) track.stop();
  recordButton.classList.remove("recording");
  recordButtonLabel.textContent = "Start";
}

async function submitRecording() {
  const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
  chunks = [];
  if (blob.size < 500) {
    setStatus({ state: "ready", message: "Recording was too short." });
    return;
  }

  try {
    setStatus({ state: "processing", message: "Sending audio..." });
    const audioBytes = await blob.arrayBuffer();
    const result = await window.openflow.submitRecording({
      audioBytes,
      mimeType: blob.type,
      durationMs: Date.now() - recordingStartedAt
    });
    latestTranscript.textContent = result.cleaned || result.raw || "No speech detected.";
  } catch (error) {
    setStatus({ state: "error", message: error?.message || String(error) });
  }
}

async function toggleRecording() {
  if (mediaRecorder?.state === "recording") {
    stopRecording();
  } else {
    await startRecording();
  }
}

recordButton.addEventListener("click", () => {
  toggleRecording().catch((error) => setStatus({ state: "error", message: error.message }));
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    const saved = await window.openflow.saveSettings(formPayload(false));
    fields.apiKey.value = "";
    applySettings(saved);
    setStatus({ state: "ready", message: "Settings saved." });
  } catch (error) {
    setStatus({ state: "error", message: error.message });
  }
});

testProviderButton.addEventListener("click", async () => {
  try {
    testProviderButton.disabled = true;
    setStatus({ state: "processing", message: "Testing provider..." });
    await window.openflow.testProvider(formPayload(false));
    setStatus({ state: "ready", message: "Provider connection works." });
  } catch (error) {
    setStatus({ state: "error", message: error.message });
  } finally {
    testProviderButton.disabled = false;
  }
});

openDataFolderButton.addEventListener("click", () => {
  window.openflow.openDataFolder();
});

expandButton.addEventListener("click", async () => {
  const nextMode = windowMode === "expanded" ? "compact" : "expanded";
  const appliedMode = await window.openflow.setWindowMode(nextMode);
  applyWindowMode(appliedMode);
});

hideButton.addEventListener("click", () => {
  window.openflow.hideWindow();
});

window.openflow.onToggleRecording(() => {
  toggleRecording().catch((error) => setStatus({ state: "error", message: error.message }));
});
window.openflow.onStatus(setStatus);
window.openflow.onSettingsChanged(applySettings);
window.openflow.onWindowMode(applyWindowMode);

window.openflow.getSettings().then(applySettings).catch((error) => {
  setStatus({ state: "error", message: error.message });
});
