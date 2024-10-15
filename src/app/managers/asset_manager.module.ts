import { getElement, roundTo, sleep } from "../util/general.util.js"

const imagePaths: string[] = []
const soundPahts: string[] = []

const allAssets: Map<string, HTMLImageElement | HTMLAudioElement> = new Map()

export function getAsset<T extends "img" | "audio", P = T extends "img" ? HTMLImageElement : HTMLAudioElement>(
	src: string
): P {
	const asset = allAssets.get(src)
	if (!asset) throw Error(`asset "${src}" has not been loaded!`)
	return asset as P
}

let loadedAssetsCount = 0
let totalAssetCount = 0

export function Assets({ img, audio }: assetsParams) {
	if (img) imagePaths.push(...img.map((src) => `app/assets/img/${src}`))
	if (audio) soundPahts.push(...audio.map((src) => `app/assets/audio/${src}`))
	return function (constructor: Function) {}
}

export async function loadAssets(): Promise<void> {
	// console.log("loading started!")
	totalAssetCount = [...imagePaths, ...soundPahts].length
	const timeOfLoadStart = Date.now()
	const allPromises = [...imagePaths.map((src) => loadImage(src)), ...soundPahts.map((src) => loadAudio(src))]
	await Promise.all(allPromises)
	const timeOfLoadCompletion = Date.now()
	// console.log(`loading completed in ${(timeOfLoadCompletion - timeOfLoadStart) / 1000} seconds!`)
}

function loadImage(src: string): Promise<void> {
	return new Promise((resolve) => {
		const img = new Image()
		img.src = src
		img.addEventListener("load", () => {
			incrementLoadCounter()
			allAssets.set(src.replace("app/assets/img/", ""), img)
			resolve()
		})
	})
}

function loadAudio(src: string): Promise<void> {
	return new Promise((resolve) => {
		const audio = new Audio(src)
		audio.addEventListener("canplaythrough", () => {
			incrementLoadCounter()
			allAssets.set(src.replace("app/assets/audio/", ""), audio)
			resolve()
		})
	})
}

async function incrementLoadCounter(): Promise<void> {
	loadedAssetsCount++
	const progress = `${roundTo((loadedAssetsCount / totalAssetCount) * 100)}`
	getElement(".loading .progress-thumb").style.width = `${progress}%`
	getElement(".loading .row span").innerHTML = `${progress}%`
	if (progress === `100`) finishLoading()
}

async function finishLoading(): Promise<void> {
	getElement(".loading > span").innerHTML = "DONE!"
	// console.log(allAssets)
	await sleep(500)
	getElement(".loading").classList.add("d-none-animated")
}

type assetsParams = {
	img?: string[]
	audio?: string[]
}
