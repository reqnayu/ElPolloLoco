import { MESSAGER } from "../../script.js"
import { SoundAsset } from "../modules/sound_asset.module.js"

export class SoundManager {
	allAudioElements: Map<string, SoundAsset> = new Map()

	volumes: Record<keyof audioTypes, number> = {
		master: 1,
		music: 1,
		sfx: 1,
		menu: 1
	}

	constructor() {
		MESSAGER.elements.set("soundManager", this)
		window.addEventListener("pausegame", () => this.pauseAll())
		window.addEventListener("resumegame", () => this.resumeAll())
	}

	setVolumes(volumes: typeof this.volumes): void {
		console.log(this.allAudioElements)
	}

	setVolumeType(volume: number, type: keyof audioTypes): void {
		this.volumes[type] = volume

		Array.from(this.allAudioElements)
			.filter(
				([name, soundAsset]) =>
					soundAsset.disabled === false && (type === "master" || soundAsset.audioType === type)
			)
			.forEach(([name, soundAsset]) => soundAsset.setVolume())
	}

	getVolume(type: keyof Omit<typeof this.volumes, "master">): number {
		return this.volumes[type] * this.volumes.master
	}

	pauseAll(): void {
		this.allAudioElements.forEach((soundAsset) => soundAsset.pause())
	}

	resumeAll(): void {
		this.allAudioElements.forEach((soundAsset) => soundAsset.resume())
	}
}

export type audioTypes = {
	master?: undefined
	music: HTMLAudioElement[]
	sfx: HTMLAudioElement[]
	menu: HTMLAudioElement[]
}
