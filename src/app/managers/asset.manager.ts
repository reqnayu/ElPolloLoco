import { getElement, roundTo, sleep } from "../util/general.util.js"

export class AssetManager {
	public static imagePaths: string[] = []
	public static soundPahts: string[] = []

	public static allAssets: Map<string, HTMLImageElement | HTMLAudioElement> = new Map()

	public static getAsset<T extends "img" | "audio", P = T extends "img" ? HTMLImageElement : HTMLAudioElement>(
		src: string
	): P {
		const asset = this.allAssets.get(src)
		if (!asset) throw Error(`asset "${src}" has not been loaded!`)
		return asset as P
	}

	private static loadedAssetsCount = 0
	private static totalAssetCount = 0

	public static async loadAssets(): Promise<void> {
		// console.log("loading started!")
		this.totalAssetCount = [...this.imagePaths, ...this.soundPahts].length
		const timeOfLoadStart = Date.now()
		const allPromises = [...this.imagePaths.map((src) => this.loadImage(src)), ...this.soundPahts.map((src) => this.loadAudio(src))]
		await Promise.all(allPromises)
		const timeOfLoadCompletion = Date.now()
		// console.log(`loading completed in ${(timeOfLoadCompletion - timeOfLoadStart) / 1000} seconds!`)
	}

	public static loadImage(src: string): Promise<void> {
		return new Promise((resolve) => {
			const img = new Image()
			img.src = src
			img.addEventListener("load", () => {
				this.incrementLoadCounter()
				this.allAssets.set(src.replace("app/assets/img/", ""), img)
				resolve()
			})
		})
	}

	public static loadAudio(src: string): Promise<void> {
		return new Promise((resolve) => {
			const audio = new Audio(src)
			audio.addEventListener("canplaythrough", () => {
				this.incrementLoadCounter()
				this.allAssets.set(src.replace("app/assets/audio/", ""), audio)
				resolve()
			})
		})
	}

	private static async incrementLoadCounter(): Promise<void> {
		this.loadedAssetsCount++
		const progress = `${roundTo((this.loadedAssetsCount / this.totalAssetCount) * 100)}`
		getElement(".loading .progress-thumb").style.width = `${progress}%`
		getElement(".loading .row span").innerHTML = `${progress}%`
		if (progress === `100`) this.finishLoading()
	}

	private static async finishLoading(): Promise<void> {
		getElement(".loading > span").innerHTML = "DONE!"
		// console.log(allAssets)
		await sleep(500)
		getElement(".loading").classList.add("d-none-animated")
	}
}

type assetsParams = {
	img?: string[]
	audio?: string[]
}


export function Assets({ img, audio }: assetsParams) {
	if (img) AssetManager.imagePaths.push(...img.map((src) => `app/assets/img/${src}`))
	if (audio) AssetManager.soundPahts.push(...audio.map((src) => `app/assets/audio/${src}`))
	return function (constructor: Function) {}
}