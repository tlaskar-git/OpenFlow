const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("openflow", {
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings) => ipcRenderer.invoke("settings:save", settings),
  testProvider: (settings) => ipcRenderer.invoke("provider:test", settings),
  submitRecording: (payload) => ipcRenderer.invoke("recording:audio", payload),
  openDataFolder: () => ipcRenderer.invoke("settings:open-data-folder"),
  setWindowMode: (mode) => ipcRenderer.invoke("window:set-mode", mode),
  hideWindow: () => ipcRenderer.invoke("window:hide"),
  onToggleRecording: (callback) => {
    ipcRenderer.on("recording:toggle", callback);
  },
  onWindowMode: (callback) => {
    ipcRenderer.on("window:mode", (_event, mode) => callback(mode));
  },
  onStatus: (callback) => {
    ipcRenderer.on("status:update", (_event, status) => callback(status));
  },
  onSettingsChanged: (callback) => {
    ipcRenderer.on("settings:changed", (_event, settings) => callback(settings));
  }
});
