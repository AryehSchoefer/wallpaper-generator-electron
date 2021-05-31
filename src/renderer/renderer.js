const apikeyInput = document.querySelector('#api-key')
const loadKeyBtn = document.querySelector('#load-key')
const saveKeyBtn = document.querySelector('#save-key')
const imgElem = document.querySelector('#wallpaper')
const searchInput = document.querySelector('#search-query')
const getWallpaperBtn = document.querySelector('#get-wallpaper')

loadKeyBtn.addEventListener('click', () => {
	window.api.send('toMain', ['load-key'])
	window.api.receive('fromMain', ({ key: API_KEY }) => {
		apikeyInput.placeholder = `API-KEY: ${API_KEY}`
	})
})

saveKeyBtn.addEventListener('click', () => {
	window.api.send('toMain', ['save-key', apikeyInput.value])
})

imgElem.addEventListener('click', (event) => {
	const base64Image = convertImageToBase64(event.target)
	window.api.send('toMain', ['set-wallpaper', base64Image])
})

getWallpaperBtn.addEventListener('click', () => {
	getWallpaperBtn.textContent = 'Loading..'
	setWallpaperAsIMGElem(searchInput.value)
	getWallpaperBtn.textContent = 'Get'
})

function randomInteger(max) {
	return Math.floor(Math.random() * max)
}

function convertImageToBase64(img) {
	const canvas = document.createElement('canvas')
	canvas.width = wallpaperObj.width
	canvas.height = wallpaperObj.height
	const context = canvas.getContext('2d')
	context.drawImage(img, 0, 0)
	const dataURL = canvas.toDataURL('image/jpeg')
	return dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, '')
}

function setWallpaperAsIMGElem(query) {
	window.api.send('toMain', ['get-wallpaper', query])

	window.api.receive('fromMain', (photos) => {
		const photoIndex = randomInteger(photos.length)
		const wallpaperURL = photos[photoIndex].src.original
		const { width, height } = photos[photoIndex]
		imgElem.src = wallpaperURL
		wallpaperObj.url = wallpaperURL
		wallpaperObj.width = width
		wallpaperObj.height = height
	})
}
