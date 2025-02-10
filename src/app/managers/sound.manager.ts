import { audioTypes } from "../.types/types.js"
import SoundAsset from "../modules/sound_asset.module.js"

/**
 * SoundManager is responsible for managing audio assets, controlling their volumes,
 * and handling play, pause, and resume functionality for different audio types.
 */
export default abstract class SoundManager {
  /** A map of all audio elements, identified by name */
  private static allAudioElements: Map<string, SoundAsset> = new Map()

  /** Getter for the allAudioElements map */
  public static get AllAudioElements(): typeof this.allAudioElements {
    return this.allAudioElements
  }

  /** A record for storing volume levels for each audio type */
  public static volumes: Record<keyof audioTypes, number> = {
    master: 1,
    music: 1,
    sfx: 1,
    menu: 1,
  }

  /**
   * Initializes the SoundManager by setting up event listeners for pausing and resuming the game.
   */
  constructor() {}

  /**
   * Initializes the SoundManager, setting up event listeners for pausing and resuming the game.
   * @returns {void}
   */
  public static initialize(): void {
    window.addEventListener("pausegame", () => this.pauseAll())
    window.addEventListener("resumegame", () => this.resumeAll())
  }

  /**
   * Sets the volume for a specific audio type.
   *
   * @param {number} volume - The volume level to set (0 to 1).
   * @param {keyof audioTypes} type - The audio type to adjust the volume for (e.g., "master", "music", etc.).
   */
  public static setVolumeType(volume: number, type: keyof audioTypes): void {
    this.volumes[type] = volume

    // Adjust volume for each audio asset based on the type
    Array.from(this.allAudioElements)
      .filter(
        ([name, soundAsset]) =>
          soundAsset.disabled === false && (type === "master" || soundAsset.audioType === type)
      )
      .forEach(([name, soundAsset]) => soundAsset.setVolume())
  }

  /**
   * Retrieves the volume level for a specific audio type, considering the master volume.
   *
   * @param {keyof Omit<typeof this.volumes, "master">} type - The audio type to get the volume for.
   * @returns {number} - The adjusted volume level (between 0 and 1).
   */
  public static getVolume(type: keyof Omit<typeof this.volumes, "master">): number {
    return this.volumes[type] * this.volumes.master
  }

  /**
   * Retrieves a specific sound asset by its name.
   *
   * @param {string} name - The name of the sound asset to retrieve.
   * @returns {SoundAsset | undefined} - The sound asset if found, or undefined if not.
   */
  public static getSound(name: string): SoundAsset | undefined {
    return this.allAudioElements.get(name)
  }

  /**
   * Pauses all audio elements managed by the SoundManager.
   * @returns {void}
   */
  public static pauseAll(): void {
    this.allAudioElements.forEach((soundAsset) => soundAsset.pause())
  }

  /**
   * Resumes all audio elements managed by the SoundManager.
   * @returns {void}
   */
  public static resumeAll(): void {
    this.allAudioElements.forEach((soundAsset) => soundAsset.resume())
  }

  /**
   * Adds a new sound asset to the SoundManager's collection.
   *
   * @param {string} name - The name to associate with the sound asset.
   * @param {SoundAsset} element - The sound asset to add.
   */
  public static addSoundAsset(name: string, element: SoundAsset): void {
    this.allAudioElements.set(name, element)
  }
}
