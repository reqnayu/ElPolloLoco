import {
  audioTypes,
  GameObjectType,
  keyInputAction,
  lang,
  resourceAmountParams,
  statusBars,
} from "../.types/types.js"
import SoundManager from "../managers/sound.manager.js"
import Language from "./language.module.js"

/**
 * The Settings class handles the game configuration, including language, key bindings,
 * resource values, and game preferences (e.g., whether FPS is enabled or snore is disabled).
 * It also manages saving and loading of user preferences to and from local storage.
 */
export default abstract class Settings {
  /** The current language setting for the game (defaults to 'de' if the browser language is German, otherwise 'en') */
  public static language: lang = navigator.language.startsWith("de") ? "de" : "en"

  /** The key bindings for various in-game actions */
  public static keyBindings: Record<keyInputAction, string> = {
    MOVE_RIGHT: "KeyD",
    MOVE_LEFT: "KeyA",
    JUMP: "Space",
    PAUSE: "Tab",
    FULLSCREEN: "KeyF",
    THROW: "KeyT",
  }

  /** Flag to disable snore sound effect */
  public static snoreDisabled = false

  /** Flag to disable countdown timer */
  public static countdownDisabled = false

  /** Flag to enable or disable FPS display */
  public static fpsEnabled = false

  /** Default resource amounts for different in-game elements (e.g., HP, bottle, coins) */
  public static readonly resources: Record<keyof statusBars | string, number> = {
    hp: 200,
    bottle: 8,
    coin: 20,
    endbossHp: 500,
    enemySmallHp: 50,
    enemyNormalHp: 100,
    potionHealing: 100,
    potionCost: 10,
    bottleCost: 3,
  }

  /** The costs of various items in the game (e.g., health points, bottles) */
  public static readonly itemCosts: Record<keyof Omit<resourceAmountParams, "coins">, number> = {
    healthPoints: 10,
    bottles: 3,
  }

  /** The spawn locations for different types of game objects (e.g., enemies, endboss) */
  public static readonly spawnLocations: Record<GameObjectType | string, number> = {
    endboss: 8000,
  }

  /** The countdown time (defaults to 0) */
  public static readonly countdownTime: number = 0

  /** The height of the floor in the game */
  public static readonly floorHeight = 85

  /** The maximum number of enemies allowed in the game at any given time */
  public static readonly maxAmountOfEnemies = 10

  /** Flag to enable or disable drawing of colliders for debugging */
  public static readonly drawColliders = false

  /** The damage values for various types of game objects (e.g., enemies, endboss, bottles) */
  public static readonly damage: Record<Extract<GameObjectType, "enemy" | "endboss" | "bottle">, number> = {
    enemy: 20,
    endboss: 50,
    bottle: 100,
  }

  /** The maximum horizontal position on the game map */
  public static readonly maxPosX = 10 * 1000

  /**
   * Initializes the game settings by loading the saved settings and changing the language.
   */
  public static initialize(): void {
    this.loadSettings()
    Language.change(this.language)
  }

  /**
   * Saves the current settings to local storage.
   */
  public static saveSettings(): void {
    const settings: savedSettings = {
      language: this.language,
      keyBindings: this.keyBindings,
      volumes: SoundManager.volumes,
      snoreDisabled: this.snoreDisabled,
      fpsEnabled: this.fpsEnabled,
    }
    localStorage.setItem("settings", JSON.stringify(settings))
    // console.log("settings saved")
  }

  /**
   * Loads the settings from local storage and applies them. If no settings are found, default values are used.
   */
  public static loadSettings(): void {
    const settingsString = localStorage.getItem("settings")
    if (!settingsString) return this.saveSettings()
    const settings = this.getSavedSettings(settingsString)
    this.language = settings.language
    this.keyBindings = settings.keyBindings
    SoundManager.volumes = settings.volumes
    this.snoreDisabled = settings.snoreDisabled
    this.fpsEnabled = settings.fpsEnabled
  }

  /**
   * Parses the saved settings and returns the corresponding object. If any required settings are missing,
   * default values are used and the settings are re-saved.
   *
   * @param settingsString The raw JSON string containing the saved settings.
   * @returns The parsed and validated settings object.
   */
  private static getSavedSettings(settingsString: string): savedSettings {
    const { language, keyBindings, volumes, snoreDisabled, fpsEnabled } = JSON.parse(
      settingsString
    ) as Partial<savedSettings>
    if (
      language === undefined ||
      keyBindings === undefined ||
      volumes === undefined ||
      snoreDisabled === undefined ||
      fpsEnabled === undefined
    ) {
      this.saveSettings()
    }
    return {
      language: language ?? this.language,
      keyBindings: keyBindings ?? this.keyBindings,
      volumes: volumes ?? SoundManager.volumes,
      snoreDisabled: snoreDisabled ?? this.snoreDisabled,
      fpsEnabled: fpsEnabled ?? this.fpsEnabled,
    }
  }
}

/**
 * Represents the shape of the saved settings object in local storage.
 */
type savedSettings = {
  language: lang
  keyBindings: Record<keyInputAction, string>
  volumes: Record<keyof audioTypes, number>
  snoreDisabled: boolean
  fpsEnabled: boolean
}
