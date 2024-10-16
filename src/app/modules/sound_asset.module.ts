import { MESSAGER } from "../../script.js"
import { getAsset } from "../managers/asset_manager.module.js"
import { audioTypes } from "../managers/sound_manager.module.js"
import { Interval } from "./interval.module.js"

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
		this.soundManager = MESSAGER.dispatch("soundManager")
		this.name = src.match(/(?<=\/)\w+(?=\.)/g)![0]
		this.audioElement = getAsset<"audio">(src)
		this.soundManager.allAudioElements.set(this.name, this)
		this.setVolume()
		if (this.name === "Snore") this.disabled = MESSAGER.dispatch("main").settings.snoreDisabled
	}

	setVolume(): void {
		this.audioElement.volume = this.soundManager.getVolume(this.audioType)
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
			new Interval({
				handler: () => {
					this.audioElement.volume = Math.max(0, this.audioElement.volume - stepSize)
				},
				stopConditionCallback: () => this.audioElement.volume === 0,
				stopCallback: () => {
					this.stop()
					this.audioElement.volume = startVolume
					resolve()
				},
				timeout: frequency,
				isPausable: false
			}).resume()
		})
	}

	disable(): void {
		this.disabled = true
		this.audioElement.volume = 0
	}

	enable(): void {
		this.disabled = false
		const typeVolume = this.soundManager.volumes[this.audioType]
		this.audioElement.volume = typeVolume
		// this.soundManager.setVolumeType(typeVolume, this.audioType)
	}

	get isPaused(): boolean {
		return this.audioElement.paused && this.audioElement.currentTime !== 0
	}
}
