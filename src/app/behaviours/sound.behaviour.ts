import { Audible, audioTypes, soundParams, soundType } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import SoundManager from "../managers/sound.manager.js"
import SoundAsset from "../modules/sound_asset.module.js"
import Util from "../util/general.util.js"

export default class SoundBehaviour implements Audible {
	public sounds: Map<string, SoundAsset>
	private soundType: soundType
	constructor({ soundType, assets }: soundParams) {
		this.soundType = soundType
		this.createSounds(assets)
		this.sounds = SoundManager.AllAudioElements.filter(([name]) => name.startsWith(soundType))
	}
	private createSounds(assets: string[]): void {
		assets.forEach((asset) => {
			const [audioType, name, isPausableString] = asset.split("/") as [
				keyof Omit<audioTypes, "master">,
				string,
				string?
			]
			const fullName = this.getFullName(name)
			if (!!SoundManager.getSound(fullName)) return
			const isPausable = isPausableString === "false" ? false : true
			new SoundAsset(audioType, fullName, isPausable)
		})
	}

	public playOnce(name: string): void {
		this.getSound(name)?.playOnce()
	}

	public playRandom(names: string[]): void {
		const randomSoundName = Util.randomize(names)
		const randomSound = this.getSound(randomSoundName)
		if (randomSound === undefined) throw Error(`sound ${randomSoundName} does not exist!`)
		randomSound.playOnce()
	}

	public playLooped(name: string): void {
		this.getSound(name)?.playLooped()
	}

	public stop(name: string): void {
		this.getSound(name)?.stop()
	}

	public fadeOut(name: string, duration: number): Promise<void[]> {
		return this.getSound(name)!.fadeOut(duration)
	}

	private getFullName(name: string): string {
		return `${this.soundType}/${name}`
	}

	public getSound(name: string): SoundAsset | undefined {
		const sound = this.sounds.get(this.getFullName(name))
		return sound
	}
}
