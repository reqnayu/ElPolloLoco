import { GameObjectType } from "../.types/types.js"
import { keyInputAction } from "../.types/types.js"
import { audioTypes, statusBars } from "../.types/types.js"
import SoundManager from "../managers/sound.manager.js"

export default abstract class Settings {
	// private main
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
		endboss: 1500
	}

	public static initialize(): void {
		this.loadSettings()
	}

	public static saveSettings(): void {
		const settings: savedSettings = {
			keyBindings: this.keyBindings,
			volumes: SoundManager.volumes,
			snoreDisabled: this.snoreDisabled
		}
		localStorage.setItem("settings", JSON.stringify(settings))
		console.log("settings saved")
	}

	public static loadSettings(): void {
		const settingsString = localStorage.getItem("settings")
		if (!settingsString) return this.saveSettings()
		const settings = JSON.parse(settingsString) as savedSettings
		this.keyBindings = settings.keyBindings
		SoundManager.volumes = settings.volumes
		this.snoreDisabled = settings.snoreDisabled
	}
}

type savedSettings = {
	keyBindings: Record<keyInputAction, string>
	volumes: Record<keyof audioTypes, number>
	snoreDisabled: boolean
}
