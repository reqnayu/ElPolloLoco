import { MESSAGER } from "../../script.js"
import { Audible } from "../.types/behaviours.interface.js"
import { SoundAsset } from "../modules/sound_asset.module.js"

export class SoundBehaviour implements Audible {
	sounds: Map<string, SoundAsset>
	constructor() {
		this.sounds = MESSAGER.dispatch("soundManager").allAudioElements
	}

	playOnce(name: string): void {
		this.sounds.get(name)?.playOnce()
	}

	playLooped(name: string): void {
		this.sounds.get(name)?.playLooped()
	}

	stop(name: string): void {
		this.sounds.get(name)?.stop()
	}
}
