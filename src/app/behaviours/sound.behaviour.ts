import { MESSAGER } from "../../script.js"
import { soundParams } from "../.types/behaviour.type.js"
import { Audible } from "../.types/behaviours.interface.js"
import { GameObjectType } from "../.types/gameObject.type.js"
import { audioTypes } from "../managers/sound_manager.module.js"
import { SoundAsset } from "../modules/sound_asset.module.js"
import { randomize, roundTo } from "../util/general.util.js"

export class SoundBehaviour implements Audible {
	sounds: Map<string, SoundAsset>
	private soundType: soundType
	private soundManager = MESSAGER.dispatch("soundManager")
	constructor({ soundType, assets }: soundParams) {
		this.soundType = soundType
		this.createSounds(assets)
		this.sounds = this.soundManager.allAudioElements.filter(([name]) => name.startsWith(soundType))
	}

	private createSounds(assets: string[]): void {
		assets.forEach((asset) => {
			const [audioType, name, isPausableString] = asset.split("/") as [
				keyof Omit<audioTypes, "master">,
				string,
				string?
			]
			const fullName = this.getFullName(name)
			if (!!this.soundManager.allAudioElements.get(fullName)) return
			const isPausable = isPausableString === "false" ? false : true
			new SoundAsset(audioType, fullName, isPausable)
		})
	}

	playOnce(name: string): void {
		this.getSound(name)?.playOnce()
	}

	playRandom(names: string[]): void {
		this.getRandomSound(names)?.playOnce()
	}

	playLooped(name: string): void {
		this.getSound(name)!.playLooped()
	}

	stop(name: string): void {
		this.getSound(name)?.stop()
	}

	fadeOut(name: string, duration: number): Promise<void> {
		return this.getSound(name)!.fadeOut(duration)
	}

	private getFullName(name: string): string {
		return `${this.soundType}/${name}`
	}

	getSound(name: string): SoundAsset | undefined {
		const sound = this.sounds.get(this.getFullName(name))
		return sound
	}

	getRandomSound(names: string[]): SoundAsset | undefined {
		const randomIndex = roundTo(randomize(0, names.length - 1))
		const randomSoundName = names[randomIndex]
		return this.getSound(randomSoundName)
	}
}

export type soundType = GameObjectType | "gui"
