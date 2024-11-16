import { audioTypes } from "../.types/types.js"
import SoundAsset from "../modules/sound_asset.module.js"

export default abstract class SoundManager {
	private static allAudioElements: Map<string, SoundAsset> = new Map()

	public static get AllAudioElements(): typeof this.allAudioElements {
		return this.allAudioElements
	}

	public static volumes: Record<keyof audioTypes, number> = {
		master: 1,
		music: 1,
		sfx: 1,
		menu: 1
	}

	constructor() {}

	public static initialize(): void {
		window.addEventListener("pausegame", () => this.pauseAll())
		window.addEventListener("resumegame", () => this.resumeAll())
	}

	public static setVolumeType(volume: number, type: keyof audioTypes): void {
		this.volumes[type] = volume

		Array.from(this.allAudioElements)
			.filter(
				([name, soundAsset]) =>
					soundAsset.disabled === false && (type === "master" || soundAsset.audioType === type)
			)
			.forEach(([name, soundAsset]) => soundAsset.setVolume())
	}

	public static getVolume(type: keyof Omit<typeof this.volumes, "master">): number {
		return this.volumes[type] * this.volumes.master
	}

	public static getSound(name: string): SoundAsset | undefined {
		return this.allAudioElements.get(name)
	}

	public static pauseAll(): void {
		this.allAudioElements.forEach((soundAsset) => soundAsset.pause())
	}

	public static resumeAll(): void {
		this.allAudioElements.forEach((soundAsset) => soundAsset.resume())
	}

	public static addSoundAsset(name: string, element: SoundAsset) {
		this.allAudioElements.set(name, element)
	}
}
