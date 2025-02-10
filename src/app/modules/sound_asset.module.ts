import { audioTypes } from "../.types/types.js"
import AssetManager from "../managers/asset.manager.js"
import SoundManager from "../managers/sound.manager.js"
import Interval from "./interval.module.js"
import Settings from "./settings.module.js"

/**
 * The SoundAsset class represents an individual audio asset (e.g., a sound effect or music track).
 * It provides methods for playing, pausing, resuming, stopping, and managing sound instances, as well
 * as controlling the volume and enabling/disabling the sound asset.
 */
export default class SoundAsset {
  /** The HTMLAudioElement used to play this sound asset */
  audioElement: HTMLAudioElement

  /** A flag indicating if the sound is disabled (no sound) */
  disabled = false

  /** The name of the sound asset, derived from the file path */
  name: string

  /** The array of sound instances (HTMLAudioElements) that are currently playing */
  private instances: HTMLAudioElement[] = []

  /**
   * Creates a new SoundAsset instance.
   *
   * @param audioType The type of audio (e.g., background, music, sound effect).
   * @param src The source file path of the audio asset.
   * @param isPausable Flag to determine whether the sound can be paused and resumed (defaults to true).
   */
  constructor(
    public audioType: keyof Omit<audioTypes, "master">,
    public src: string,
    public isPausable: boolean = true
  ) {
    this.name = src.split(".")[0]
    this.audioElement = AssetManager.getAsset<"audio">(src)
    SoundManager.addSoundAsset(this.name, this)
    this.setVolume()
    if (this.name === "player/Snore") Settings.snoreDisabled ? this.disable() : this.enable()
  }

  /**
   * Sets the volume of the sound asset and its instances.
   *
   * @param volume The volume level to set (default is the current volume from SoundManager).
   */
  setVolume(volume = SoundManager.getVolume(this.audioType)): void {
    this.audioElement.volume = volume
    this.instances.forEach((instance) => (instance.volume = volume))
  }

  /**
   * Plays the sound once, and resolves when the sound finishes playing.
   *
   * @returns A promise that resolves when the sound finishes playing.
   */
  async playOnce(): Promise<void> {
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

  /**
   * Creates a new instance of the sound (clones the audio element) and adds it to the instances array.
   *
   * @returns A cloned instance of the sound to be played.
   */
  private newInstance(): HTMLAudioElement {
    const sound = this.audioElement.cloneNode() as HTMLAudioElement
    sound.volume = this.audioElement.volume
    this.instances.push(sound)
    return sound
  }

  /**
   * Plays the sound in a loop until it is stopped or an error occurs.
   *
   * @returns A promise that resolves once the sound finishes looping, or is interrupted.
   */
  async playLooped(): Promise<void> {
    while (true) {
      try {
        await this.playOnce()
      } catch (e) {
        return
      }
    }
  }

  /**
   * Pauses all instances of the sound asset, if it is pausable.
   */
  pause(): void {
    if (!this.isPausable) return
    this.instances.forEach((instance) => instance.pause())
  }

  /**
   * Resumes all paused instances of the sound asset, if it is pausable.
   */
  resume(): void {
    if (!this.isPausable) return
    this.instances.forEach((instance) => {
      if (!instance.paused || instance.currentTime === 0) return
      instance.play()
    })
  }

  /**
   * Stops all instances of the sound asset, resets their playback position, and dispatches a 'stop' event.
   */
  stop(): void {
    const stopEvent = new CustomEvent("stop")
    this.instances.forEach((instance) => {
      if (instance.currentTime === 0) return
      instance.pause()
      instance.currentTime = 0
      instance.dispatchEvent(stopEvent)
    })
  }

  /**
   * Fades out the sound instances over a specified duration.
   *
   * @param duration The duration of the fade-out effect in milliseconds.
   * @returns A promise that resolves when the fade-out is complete.
   */
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

  /**
   * Disables the sound asset by setting its volume to 0.
   */
  disable(): void {
    this.disabled = true
    this.setVolume(0)
  }

  /**
   * Enables the sound asset by restoring its volume.
   */
  enable(): void {
    this.disabled = false
    this.setVolume()
  }

  /**
   * Checks whether any instance of the sound is paused.
   *
   * @returns True if any instance is paused, otherwise false.
   */
  get isPaused(): boolean {
    return !!this.instances.find((instance) => instance.paused)
  }
}
