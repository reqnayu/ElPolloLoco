import { audioTypes } from "../.types/types.js"
import AssetManager from "../managers/asset.manager.js"
import SoundManager from "../managers/sound.manager.js"
import Interval from "./interval.module.js"
import Settings from "./settings.module.js"

export default class SoundAsset {
	audioElement: HTMLAudioElement
	disabled = false
	name: string
	private instances: HTMLAudioElement[] = []

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
		const volume = SoundManager.getVolume(this.audioType)
		this.audioElement.volume = volume
		this.instances.forEach((instance) => (instance.volume = volume))
	}

	async playOnce(): Promise<void> {
		if (this.disabled) return
		const sound = this.newInstance()
		sound.play()
		return new Promise((resolve, reject) => {
			sound.addEventListener("stop", () => reject())
			sound.addEventListener(
				"ended",
				() => {
					resolve()
					sound.currentTime = 0
					this.instances.remove(sound)
					sound.remove()
				},
				{ once: true }
			)
		})
	}

	private newInstance(): HTMLAudioElement {
		const sound = this.audioElement.cloneNode() as HTMLAudioElement
		sound.volume = this.audioElement.volume
		this.instances.push(sound)
		return sound
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
		this.instances.forEach((instance) => instance.pause())
	}

	resume(): void {
		if (!this.isPaused) return
		this.instances.forEach((instance) => instance.play())
	}

	stop(): void {
		this.instances.forEach((instance) => {
			if (instance.currentTime === 0) return
			instance.currentTime = 0
			instance.pause()
			const stopEvent = new CustomEvent("stop")
			instance.dispatchEvent(stopEvent)
		})
	}

	fadeOut(duration: number): Promise<void[]> {
		return Promise.all(
			this.instances.map((instance) => {
				return new Promise<void>((resolve) => {
					if (instance.paused) return resolve()
					const startVolume = instance.volume
					const frequency = 50
					const stepSize = (startVolume / duration) * frequency
					new Interval(
						() => {
							instance.volume = Math.max(0, instance.volume - stepSize)
						},
						frequency,
						() => instance.volume === 0,
						() => {
							this.stop()
							instance.volume = startVolume
							resolve()
						}
					).resume()
				})
			})
		)
	}

	disable(): void {
		this.disabled = true
		this.audioElement.volume = 0
	}

	enable(): void {
		this.disabled = false
		const typeVolume = SoundManager.volumes[this.audioType]
		this.audioElement.volume = typeVolume
	}

	get isPaused(): boolean {
		return this.audioElement.paused && this.audioElement.currentTime !== 0
	}
}
