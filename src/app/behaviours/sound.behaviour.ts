import { Audible, audioTypes, soundParams, soundType } from "../.types/types.js"
import SoundManager from "../managers/sound.manager.js"
import SoundAsset from "../modules/sound_asset.module.js"
import Util from "../util/general.util.js"

/**
 * Handles sound playback and management for a game object.
 *
 * @implements {Audible}
 */
export default class SoundBehaviour implements Audible {
  /** A map of sound names to their corresponding SoundAsset objects. */
  public sounds: Map<string, SoundAsset>

  /** The category or type of sound (e.g., "effects", "music"). */
  private soundType: soundType

  /**
   * Creates an instance of SoundBehaviour.
   *
   * @param {soundParams} params - The parameters for initializing the sound behavior.
   * @param {soundType} params.soundType - The type/category of sound.
   * @param {string[]} params.assets - A list of sound asset file paths.
   */
  constructor({ soundType, assets }: soundParams) {
    this.soundType = soundType
    this.createSounds(assets)
    this.sounds = SoundManager.AllAudioElements.filter(([name]) => name.startsWith(soundType))
  }

  /**
   * Creates and registers sound assets.
   *
   * @private
   * @param {string[]} assets - A list of sound asset file paths.
   */
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

  /**
   * Plays a sound once.
   *
   * @param {string} name - The name of the sound to play.
   */
  public playOnce(name: string): void {
    this.getSound(name)?.playOnce()
  }

  /**
   * Plays a random sound from a given list.
   *
   * @param {string[]} names - An array of possible sound names.
   * @throws {Error} If the selected random sound does not exist.
   */
  public playRandom(names: string[]): void {
    const randomSoundName = Util.randomize(names)
    const randomSound = this.getSound(randomSoundName)
    if (randomSound === undefined) throw Error(`Sound ${randomSoundName} does not exist!`)
    randomSound.playOnce()
  }

  /**
   * Plays a sound in a loop.
   *
   * @param {string} name - The name of the sound to loop.
   */
  public playLooped(name: string): void {
    this.getSound(name)?.playLooped()
  }

  /**
   * Stops a currently playing sound.
   *
   * @param {string} name - The name of the sound to stop.
   */
  public stop(name: string): void {
    this.getSound(name)?.stop()
  }

  /**
   * Fades out a sound over a given duration.
   *
   * @param {string} name - The name of the sound to fade out.
   * @param {number} duration - The duration of the fade-out in milliseconds.
   * @returns {Promise<void[]>} A promise that resolves when the fade-out is complete.
   */
  public fadeOut(name: string, duration: number): Promise<void[]> {
    return this.getSound(name)!.fadeOut(duration)
  }

  /**
   * Constructs the full name of a sound by appending its type/category.
   *
   * @private
   * @param {string} name - The base name of the sound.
   * @returns {string} The full name of the sound (e.g., "effects/jump").
   */
  private getFullName(name: string): string {
    return `${this.soundType}/${name}`
  }

  /**
   * Retrieves a sound asset by name.
   *
   * @param {string} name - The name of the sound to retrieve.
   * @returns {SoundAsset | undefined} The corresponding SoundAsset, or undefined if not found.
   */
  public getSound(name: string): SoundAsset | undefined {
    return this.sounds.get(this.getFullName(name))
  }
}
