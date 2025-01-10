import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
	on(...args: Parameters<typeof ipcRenderer.on>) {
		const [channel, listener] = args
		return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
	},
	off(...args: Parameters<typeof ipcRenderer.off>) {
		const [channel, ...omit] = args
		return ipcRenderer.off(channel, ...omit)
	},
	send(...args: Parameters<typeof ipcRenderer.send>) {
		const [channel, ...omit] = args
		return ipcRenderer.send(channel, ...omit)
	},
	invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
		const [channel, ...omit] = args
		return ipcRenderer.invoke(channel, ...omit)
	},
	isFullscreen: () => {
		return new Promise((resolve) => {
			ipcRenderer.once("isFullscreenReply", (_, isMaximized) => {
				resolve(isMaximized);
			});
			ipcRenderer.send("isFullscreen");
		});
	},
	openFileDialog: () => ipcRenderer.send('open-file-dialog'),
	selectedFile: () => {
		return new Promise((resolve) => {
			ipcRenderer.once('selected-file', (_, path) => {
				resolve(path);
			});
		});
	},

	// You can expose other APTs you need here.
	// ...
});