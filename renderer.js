const { ipcRenderer } = require('electron/renderer')
const wallpaper = require('wallpaper')
const fs = require('fs')
const path = require('path')

const apikeyInput = document.querySelector('#api-key')
const loadKeyBtn = document.querySelector('#load-key')
const saveKeyBtn = document.querySelector('#save-key')
const imgElem = document.querySelector('#wallpaper')
const searchInput = document.querySelector('#search-query')
const getWallpaperBtn = document.querySelector('#get-wallpaper')
const wallpaperObj = {
	url: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg',
	width: 5184,
	height: 3456,
}

loadKeyBtn.addEventListener('click', () => {
	ipcRenderer.send('userinput', ['load-key'])
})

saveKeyBtn.addEventListener('click', () => {
	ipcRenderer.send('userinput', ['save-key', apikeyInput.value])
})

imgElem.addEventListener('click', (event) => {
	setAsWallpaper(event)
})

getWallpaperBtn.addEventListener('click', () => {
	ipcRenderer.send('userinput', ['get-wallpaper']) // this might be useless
	getWallpaperBtn.textContent = 'Loading..'

	setWallpaper(searchInput.value)
})

function convertToBase64(img) {
	const canvas = document.createElement('canvas')
	canvas.width = wallpaperObj.width
	canvas.height = wallpaperObj.height
	const context = canvas.getContext('2d')
	context.drawImage(img, 0, 0)
	const dataURL = canvas.toDataURL('image/jpeg')
	return dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, '')
}

function setAsWallpaper(event) {
	const base64Image = convertToBase64(event.target)
	let picturePath = path.join(__dirname, 'recent.jpeg')
	picturePath = path.normalize(picturePath)
	fs.writeFile(picturePath, base64Image, 'base64', async (err) => {
		console.error(err)
		await wallpaper.set(picturePath, { scale: 'stretch' }).then(() => {
			console.log(path.resolve(picturePath))
		})
	})
}

async function setWallpaper(query) {
	API_ENDPOINT = 'https://api.pexels.com/v1/search'
	const rawdata = fs.readFileSync('config.json')
	const { key: API_KEY } = JSON.parse(rawdata)

	const response = await fetch(`${API_ENDPOINT}?query=${query}`, {
		headers: {
			Authorization: `${API_KEY}`,
		},
	})
	const { photos } = await response.json()

	const photoIndex = randomInteger(photos.length)
	const wallpaperURL = photos[photoIndex].src.original
	const { width, height } = photos[photoIndex]
	imgElem.src = wallpaperURL
	wallpaperObj.url = wallpaperURL
	wallpaperObj.width = width
	wallpaperObj.height = height

	getWallpaperBtn.textContent = 'Get'
}

function randomInteger(max) {
	return Math.floor(Math.random() * max)
}
