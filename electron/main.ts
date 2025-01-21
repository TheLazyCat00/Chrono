import { app, BrowserWindow, shell, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { ipcMain } from 'electron'
import fs from 'fs';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
const gotTheLock = app.requestSingleInstanceLock();

function createWindow() {
	win = new BrowserWindow({
		frame: false,
		icon: path.join(__dirname, "public/calendar.png"),
		webPreferences: {
			preload: path.join(__dirname, 'preload.mjs'),
		},
	})

	// Test active push message to Renderer-process.
	win.webContents.on('did-finish-load', () => {
		win?.webContents.send('main-process-message', (new Date).toLocaleString())
	})

	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL)
	} else {
		// win.loadFile('dist/index.html')
		win.loadFile(path.join(RENDERER_DIST, 'index.html'))
	}

	setIpc(win);

	win.webContents.on('will-navigate', (event, url) => {
		event.preventDefault(); // Prevent default navigation
		shell.openExternal(url); // Open link in default browser
	});
}

const chronoDirPath = path.join(
	process.env.LOCALAPPDATA || process.env.APPDATA || `${process.env.HOME}/.local/share`,
	'Chrono'
);

const appDataPath = path.join(chronoDirPath, 'storage.json');

if (!fs.existsSync(chronoDirPath)) {
	fs.mkdirSync(chronoDirPath, { recursive: true });
}

if (!fs.existsSync(appDataPath)) {
	fs.writeFileSync(appDataPath, ""); // Create an empty JSON file
}

let content = fs.readFileSync(appDataPath, 'utf-8');
if(content == ""){
	fs.writeFileSync(appDataPath, JSON.stringify({}, null, 2));
}


function setIpc(win){
	ipcMain.on("closeApp", () => {
		app.quit();
	});
	ipcMain.on("minimizeApp", () =>	{
		win.minimize();
	});
	ipcMain.on("maximizeApp", () =>	{
		if(win.isMaximized()){
			win.unmaximize();
		}
		else{
			win.maximize();
		}
	});
	ipcMain.on("isFullscreen", () => {
		win.webContents.send("isFullscreenReply", win.isMaximized());
	});
	ipcMain.on("readyToClose", () => {
		app.quit();
	});
	ipcMain.on('open-file-dialog', () => {
		dialog.showOpenDialog({
			properties: ['openFile']
		}).then(result => {
				if (!result.canceled) {
					win.webContents.send('selected-file', result.filePaths[0]);
				}
			}).catch(err => {
				console.log(err);
			});
	});
	ipcMain.on('read-storage', () => {
		let data;
		if (!fs.existsSync(appDataPath)) {
			data = {};
		}
		else{
			data = fs.readFileSync(appDataPath, 'utf-8');
			data = JSON.parse(data);
		}
		win.webContents.send("read-storage-reply", data);
	});
	ipcMain.on('write-storage', (event, data) => {
		fs.writeFileSync(appDataPath, JSON.stringify(data, null, "\t"))
	});
}

function restore(){
	if (win.isMinimized()) win.restore();
	win.focus();
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
		win = null
	}
})

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

if (!gotTheLock) {
	app.quit();
}
else{
	app.on('second-instance', () => {
		if (win) {
			restore();
		}
	});
	app.whenReady().then(createWindow);
}
