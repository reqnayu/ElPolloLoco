import { MESSAGER } from "../../script.js"
import { getAsset } from "../managers/asset_manager.module.js"
import { audioTypes } from "../managers/sound_manager.module.js"

export class SoundAsset {
	private soundManager
	audioElement: HTMLAudioElement
	disabled = false
	name: string

	constructor(
		public audioType: keyof Omit<audioTypes, "master">,
		public src: string,
		public isPausable: boolean = true
	) {
		this.name = src.match(/(?<=\/)\w+(?=\.)/g)![0]
		const volume = MESSAGER.dispatch("main").soundManager.volumes[audioType]
		this.audioElement = getAsset<"audio">(src)
		this.audioElement.volume = volume
		this.soundManager = MESSAGER.dispatch("soundManager")
		this.soundManager.allAudioElements.set(this.name, this)
		if (this.name === "Snore") this.disabled = MESSAGER.dispatch("main").settings.snoreDisabled
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

	disable(): void {
		this.disabled = true
		this.audioElement.volume = 0
	}

	enable(): void {
		this.disabled = false
		const typeVolume = this.soundManager.volumes[this.audioType]
		this.soundManager.setVolume(typeVolume, this.audioType)
	}

	setVolume(): void {
		this.audioElement.volume = this.soundManager.getVolume(this.audioType)
	}

	get isPaused(): boolean {
		return this.audioElement.paused && this.audioElement.currentTime !== 0
	}
}
