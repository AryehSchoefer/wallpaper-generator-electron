const keyDisplay = document.querySelector('#key-display')
const apikeyInput = document.querySelector('#api-key')
const loadKeyBtn = document.querySelector('#load-key')
const saveKeyBtn = document.querySelector('#save-key')
const imgElem = document.querySelector('#wallpaper')
const loadingElem = document.querySelector('#loading')
const searchInput = document.querySelector('#search-query')
const getWallpaperBtn = document.querySelector('#get-wallpaper')
const wallpaperObj = {
	url: 'https://images.pexels.com/photos/1056251/pexels-photo-1056251.jpeg',
	width: 5184,
	height: 3456,
}
const recentWallpaperObjs = []
// const recentWallpaperObjs = [
// 	{
// 		query: '',
// 		wallpapers: [...urls]
// 	}
// ]

loadKeyBtn.addEventListener('click', () => {
	window.api.send('toMain', ['load-key'])
	window.api.receive('fromMain', ({ key: API_KEY }) => {
		apikeyInput.placeholder = `API-KEY: ${API_KEY}`
		keyDisplay.textContent = `API-KEY: ${API_KEY}`
	})
})

saveKeyBtn.addEventListener('click', () => {
	window.api.send('toMain', ['save-key', apikeyInput.value])
})

imgElem.addEventListener('click', (event) => {
	const base64Image = convertImageToBase64(event.target)
	window.api.send('toMain', ['set-wallpaper', base64Image])
})

getWallpaperBtn.addEventListener('click', async () => {
	// show loading gif
	imgElem.style.display = 'none'
	loadingElem.style.display = 'block'

	setWallpaperAsIMGElem(searchInput.value)

	// remove loading gif
	await sleep(1000) // necessary for loading to function properly
	imgElem.style.display = 'block'
	loadingElem.style.display = 'none'
})

// necessary for loading to function properly
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

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

function manageWallpaperData(photos) {
	// get random index for photos array
	const photoIndex = randomInteger(photos.length)

	// set image as img elem
	const wallpaperURL = photos[photoIndex].src.original
	const { width, height } = photos[photoIndex]
	imgElem.src = wallpaperURL

	// prepare data for download
	wallpaperObj.url = wallpaperURL
	wallpaperObj.width = width
	wallpaperObj.height = height
}

function setWallpaperAsIMGElem(query) {
	const index = recentWallpaperObjs.findIndex((obj) => obj.query === query)

	if (index != -1) {
		const photos = recentWallpaperObjs[index].wallpapers
		manageWallpaperData(photos)
	} else {
		window.api.send('toMain', ['get-wallpaper', query])
		window.api.receive('fromMain', (photos, API_KEY) => {
			manageWallpaperData(photos)

			// related to scoping problem fix
			apikeyInput.placeholder = `API-KEY: ${API_KEY}`
			keyDisplay.textContent = `API-KEY: ${API_KEY}`

			// append data to 'already-seen' array
			recentWallpaperObjs.push({
				query,
				wallpapers: photos,
			})
		})
	}
}
