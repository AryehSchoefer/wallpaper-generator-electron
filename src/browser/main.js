// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron/main')
const fs = require('fs')
const path = require('path')

// hot-reload, buggy as shit (might heavily influence functionality of code)
// try {
// 	require('electron-reloader')(module)
// } catch (_) {}

function createWindow() {
	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true,
			contextIsolation: false,
		},
	})

	// and load the index.html of the app.
	mainWindow.loadFile('index.html')

	// Open the DevTools.
	process.env.NODE_ENV !== 'production' && mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('userinput', (event, args) => {
	const [msg, Key] = args
	console.log(`KEY: ${Key}`)
	switch (msg) {
		case 'load-key':
			const rawdata = fs.readFileSync('config.json')
			const { key: LoadedKey } = JSON.parse(rawdata)
			console.log(`msg: ${msg}, key: ${LoadedKey}`)
			break
		case 'save-key':
			if (!Key) return
			console.log(`msg: ${msg}, key: ${Key}`)
			fs.writeFileSync('config.json', JSON.stringify({ key: `${Key}` }))
			break
		case 'get-wallpaper':
			console.log(msg)
			break
		default:
			break
	}
})

// Key: 563492ad6f91700001000001f6fab3378c474797aeb1f944160d1630
