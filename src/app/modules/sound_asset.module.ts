import { audioTypes } from "../.types/types.js"
import AssetManager from "../managers/asset.manager.js"
import SoundManager from "../managers/sound.manager.js"
import Interval from "./interval.module.js"
import Settings from "./settings.module.js"

export default class SoundAsset {
	audioElement: HTMLAudioElement
	disabled = false
	name: string

	constructor(
		public audioType: keyof Omit<audioTypes, "master">,
		public src: string,
		public isPausable: boolean = true
	) {
		this.name = src.split(".")[0]
		this.audioElement = AssetManager.getAsset<"audio">(src)
		SoundManager.addSoundAsset(this.name, this)
		this.setVolume()
		if (this.name === "player/Snore") this.disabled = Settings.snoreDisabled
	}

	setVolume(): void {
		this.audioElement.volume = SoundManager.getVolume(this.audioType)
	}

	async playOnce(): Promise<void> {
		if (this.disabled) return
		this.audioElement.play()
		return new Promise((resolve, reject) => {
			this.audioElement.addEventListener("stop", () => reject())
			this.audioElement.addEventListener(
				"ended",
				() => {
					resolve()
					this.audioElement.currentTime = 0
				},
				{ once: true }
			)
		})
	}

	async playLooped(): Promise<void> {
		if (this.disabled) return
		while (true) {
			try {
				await this.playOnce()
			} catch (e) {
				return
			}
		}
	}

	pause(): void {
		if (!this.isPausable) return
		this.audioElement.pause()
	}

	resume(): void {
		if (!this.isPaused) return
		this.audioElement.play()
	}

	stop(): void {
		if (this.audioElement.currentTime === 0) return
		this.audioElement.currentTime = 0
		this.audioElement.pause()
		const stopEvent = new CustomEvent("stop")
		this.audioElement.dispatchEvent(stopEvent)
	}

	fadeOut(duration: number): Promise<void> {
		return new Promise((resolve) => {
			if (this.audioElement.paused) return resolve()
			const startVolume = this.audioElement.volume
			const frequency = 50
			const stepSize = (startVolume / duration) * frequency
			new Interval(
				() => {
					this.audioElement.volume = Math.max(0, this.audioElement.volume - stepSize)
				},
				frequency,
				() => this.audioElement.volume === 0,
				() => {
					this.stop()
					this.audioElement.volume = startVolume
					resolve()
				}
			).resume()
		})
	}

	disable(): void {
		this.disabled = true
		this.audioElement.volume = 0
	}

	enable(): void {
		this.disabled = false
		const typeVolume = SoundManager.volumes[this.audioType]
		this.audioElement.volume = typeVolume
		// SoundManager.setVolumeType(typeVolume, this.audioType)
	}

	get isPaused(): boolean {
		return this.audioElement.paused && this.audioElement.currentTime !== 0
	}
}
