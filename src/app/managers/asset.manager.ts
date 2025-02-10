import Util from "../util/general.util.js"

/**
 * Manages loading and storing assets such as images and audio files.
 * Provides methods to load assets and retrieve them once they are loaded.
 */
export default abstract class AssetManager {
  /**
   * Array of image paths to be loaded.
   *
   * @public
   */
  public static imagePaths: string[] = []

  /**
   * Array of audio paths to be loaded.
   *
   * @public
   */
  public static soundPaths: string[] = []

  /**
   * A map that stores loaded assets, either images or audio files.
   *
   * @public
   * @type {Map<string, HTMLImageElement | HTMLAudioElement>}
   */
  public static allAssets: Map<string, HTMLImageElement | HTMLAudioElement> = new Map()

  /**
   * Retrieves an asset by its source path. The asset type can either be an image or an audio element.
   *
   * @template T - The type of the asset ("img" or "audio").
   * @template P - The return type depending on the asset type (`HTMLImageElement` for images and `HTMLAudioElement` for audio).
   * @param {string} src - The source path of the asset.
   * @returns {P} The loaded asset (either an image or an audio element).
   * @throws Will throw an error if the asset has not been loaded.
   */
  public static getAsset<T extends "img" | "audio", P = T extends "img" ? HTMLImageElement : HTMLAudioElement>(
    src: string
  ): P {
    const asset = this.allAssets.get(src)
    if (!asset) throw Error(`asset "${src}" has not been loaded!`)
    return asset as P
  }

  /**
   * The number of assets that have been loaded.
   *
   * @private
   */
  private static loadedAssetsCount = 0

  /**
   * The total number of assets to be loaded.
   *
   * @private
   */
  private static totalAssetCount = 0

  /**
   * Loads all assets (both images and audio) by calling the respective load functions.
   * Updates the loading progress as assets are loaded.
   *
   * @public
   * @returns {Promise<void>} A promise that resolves when all assets are loaded.
   */
  public static async loadAssets(): Promise<void> {
    this.totalAssetCount = [...this.imagePaths, ...this.soundPaths].length
    const timeOfLoadStart = Date.now()
    const allPromises = [
      ...this.imagePaths.map((src) => this.loadImage(src)),
      ...this.soundPaths.map((src) => this.loadAudio(src)),
    ]
    await Promise.all(allPromises)
    const timeOfLoadCompletion = Date.now()
  }

  /**
   * Loads an image asset asynchronously and stores it in the `allAssets` map.
   *
   * @private
   * @param {string} src - The path to the image source.
   * @returns {Promise<void>} A promise that resolves once the image is loaded.
   */
  public static loadImage(src: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = src
      img.addEventListener("load", () => {
        this.incrementLoadCounter()
        this.allAssets.set(src.replace("app/assets/img/", ""), img) // Store the image asset
        resolve()
      })
    })
  }

  /**
   * Loads an audio asset asynchronously and stores it in the `allAssets` map.
   *
   * @private
   * @param {string} src - The path to the audio source.
   * @returns {Promise<void>} A promise that resolves once the audio is ready to be played.
   */
  public static loadAudio(src: string): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(src)
      audio.addEventListener("canplaythrough", () => {
        this.incrementLoadCounter()
        this.allAssets.set(src.replace("app/assets/audio/", ""), audio) // Store the audio asset
        resolve()
      })
    })
  }

  /**
   * Increments the loaded assets counter and updates the loading progress.
   * When all assets are loaded, it triggers the finish loading process.
   *
   * @private
   * @returns {Promise<void>} A promise that resolves after the progress is updated.
   */
  private static async incrementLoadCounter(): Promise<void> {
    this.loadedAssetsCount++
    const progress = `${Util.roundTo((this.loadedAssetsCount / this.totalAssetCount) * 100)}`
    Util.getElement(".loading .progress-thumb").style.width = `${progress}%`
    Util.getElement(".loading .row span").innerHTML = `${progress}%`
    if (progress === `100`) this.finishLoading()
  }

  /**
   * Finalizes the asset loading process. Displays a "DONE!" message and hides the loading screen.
   *
   * @private
   * @returns {Promise<void>} A promise that resolves after the loading process is complete.
   */
  private static async finishLoading(): Promise<void> {
    Util.getElement(".loading > span").innerHTML = "DONE!"
    await Util.sleep(500) // Wait for half a second before hiding the loading screen
    Util.getElement(".loading").classList.add("d-none-animated") // Hide the loading screen
  }
}
