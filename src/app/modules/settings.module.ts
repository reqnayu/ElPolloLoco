import { audioTypes, GameObjectType, keyInputAction, statusBars } from "../.types/types.js"
import SoundManager from "../managers/sound.manager.js"

export default abstract class Settings {
	public static keyBindings: Record<keyInputAction, string> = {
		MOVE_RIGHT: "KeyD",
		MOVE_LEFT: "KeyA",
		JUMP: "Space",
		PAUSE: "Tab",
		FULLSCREEN: "KeyF",
		THROW: "KeyT"
	}
	public static snoreDisabled = true
	public static countdownDisabled = false
	public static fpsEnabled = false
	static readonly resources: Record<keyof statusBars | string, number> = {
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

	static readonly spawnLocations: Record<GameObjectType | string, number> = {
		endboss: 5500
	}
	static readonly countdownTime: number = 0

	public static initialize(): void {
		this.loadSettings()
	}

	public static saveSettings(): void {
		const settings: savedSettings = {
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
		this.keyBindings = settings.keyBindings
		SoundManager.volumes = settings.volumes
		this.snoreDisabled = settings.snoreDisabled
		this.fpsEnabled = settings.fpsEnabled
	}

	private static getSavedSettings(settingsString: string): savedSettings {
		const { keyBindings, volumes, snoreDisabled, fpsEnabled } = JSON.parse(settingsString) as Partial<savedSettings>
		if (
			keyBindings === undefined ||
			volumes === undefined ||
			snoreDisabled === undefined ||
			fpsEnabled === undefined
		) {
			this.saveSettings()
		}
		return {
			keyBindings: keyBindings ?? this.keyBindings,
			volumes: volumes ?? SoundManager.volumes,
			snoreDisabled: snoreDisabled ?? this.snoreDisabled,
			fpsEnabled: fpsEnabled ?? this.fpsEnabled
		}
	}
}

type savedSettings = {
	keyBindings: Record<keyInputAction, string>
	volumes: Record<keyof audioTypes, number>
	snoreDisabled: boolean
	fpsEnabled: boolean
}
