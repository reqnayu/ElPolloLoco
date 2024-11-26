import { audioTypes, GameObjectType, keyInputAction, lang, resourceAmountParams, statusBars } from "../.types/types.js"
import SoundManager from "../managers/sound.manager.js"
import { Language } from "./language.module.js"

export default abstract class Settings {
	public static language: lang = navigator.language.startsWith("de") ? "de" : "en"
	public static keyBindings: Record<keyInputAction, string> = {
		MOVE_RIGHT: "KeyD",
		MOVE_LEFT: "KeyA",
		JUMP: "Space",
		PAUSE: "Tab",
		FULLSCREEN: "KeyF",
		THROW: "KeyT"
	}
	public static snoreDisabled = false
	public static countdownDisabled = false
	public static fpsEnabled = false
	public static readonly resources: Record<keyof statusBars | string, number> = {
		hp: 200,
		bottle: 8,
		coin: 20,
		endbossHp: 400,
		enemySmallHp: 50,
		enemyNormalHp: 100,
		potionHealing: 100,
		potionCost: 10,
		bottleCost: 3
	}

	public static readonly itemCosts: Record<keyof Omit<resourceAmountParams, "coins">, number> = {
		healthPoints: 10,
		bottles: 3
	}

	public static readonly spawnLocations: Record<GameObjectType | string, number> = {
		endboss: 5500
	}
	public static readonly countdownTime: number = 0

	public static initialize(): void {
		this.loadSettings()
		Language.change(this.language)
	}

	public static saveSettings(): void {
		const settings: savedSettings = {
			language: this.language,
			keyBindings: this.keyBindings,
			volumes: SoundManager.volumes,
			snoreDisabled: this.snoreDisabled,
			fpsEnabled: this.fpsEnabled
		}
		localStorage.setItem("settings", JSON.stringify(settings))
		// console.log("settings saved")
	}

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
			fpsEnabled: fpsEnabled ?? this.fpsEnabled
		}
	}
}

type savedSettings = {
	language: lang
	keyBindings: Record<keyInputAction, string>
	volumes: Record<keyof audioTypes, number>
	snoreDisabled: boolean
	fpsEnabled: boolean
}
