const axios = require('axios')
const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const wallpaper = require('wallpaper')

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: false, // this should be false
			contextIsolation: true, // this should be true
			enableRemoteModule: false, // might need to turn this to true, but should be false
		},
	})

	mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')) // wrong?

	process.env.NODE_ENV !== 'production' && mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

// main process code:

function readAPIKey() {
	const rawdata = fs.readFileSync(path.join(__dirname, 'config.json'))
	const { key: API_KEY } = JSON.parse(rawdata)
	return API_KEY
}

ipcMain.on('toMain', async (event, args) => {
	const [command, ...arguments] = args
	// let API_KEY = readAPIKey() // dev
	let rawdata

	switch (command) {
		case 'load-key':
			rawdata = fs.readFileSync(path.join(__dirname, 'config.json'))
			const key_data = JSON.parse(rawdata)
			mainWindow.webContents.send('fromMain', key_data)
			break

		case 'save-key':
			const [KEY] = arguments
			fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify({ key: `${KEY}` }))
			break

		case 'get-wallpaper':
			const [query] = arguments
			rawdata = fs.readFileSync(path.join(__dirname, 'config.json'))
			const { key: API_KEY } = JSON.parse(rawdata)
			API_ENDPOINT = 'https://api.pexels.com/v1/search'

			const response = await axios.get(`${API_ENDPOINT}?query=${query}`, {
				headers: {
					Authorization: `${API_KEY}`,
				},
			})
			const { data } = response
			const { photos } = data

			mainWindow.webContents.send('fromMain', photos)
			break

		case 'set-wallpaper':
			const [base64Image] = arguments
			let picturePath = path.join(__dirname, 'recent.jpeg')
			picturePath = path.normalize(picturePath)

			fs.writeFile(picturePath, base64Image, 'base64', async (err) => {
				if (err) console.error(err)
				await wallpaper.set(picturePath, { scale: 'stretch' }).then(() => {
					console.log(path.resolve(picturePath))
				})
			})
			break

		default:
			console.log("command didn't match any case")
			break
	}
})
