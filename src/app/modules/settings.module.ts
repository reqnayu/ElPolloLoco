import { MESSAGER } from "../../script.js"
import { keyInputAction } from "../.types/input.type.js"
import { audioTypes } from "../managers/sound_manager.module.js"
import { statusBars } from "./gui.modules.js"

export class Settings {
	private main
	keyBindings: Record<keyInputAction, string> = {
		MOVE_RIGHT: "KeyD",
		MOVE_LEFT: "KeyA",
		JUMP: "Space",
		PAUSE: "Tab",
		FULLSCREEN: "KeyF",
		THROW: "KeyT"
	}
	snoreDisabled = true
	countdownDisabled = false
	readonly resources: Record<keyof statusBars | string, number> = {
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

	constructor() {
		this.main = MESSAGER.dispatch("main")
		this.loadSettings()
	}

	saveSettings(): void {
		const settings: savedSettings = {
			keyBindings: this.keyBindings,
			volumes: MESSAGER.dispatch("main").soundManager.volumes,
			snoreDisabled: this.snoreDisabled
		}
		localStorage.setItem("settings", JSON.stringify(settings))
	}

	loadSettings(): void {
		const settingsString = localStorage.getItem("settings")
		if (!settingsString) return this.saveSettings()
		const settings = JSON.parse(settingsString) as savedSettings
		this.keyBindings = settings.keyBindings
		this.main.soundManager.volumes = settings.volumes
		this.snoreDisabled = settings.snoreDisabled
	}
}

type savedSettings = {
	keyBindings: Record<keyInputAction, string>
	volumes: Record<keyof audioTypes, number>
	snoreDisabled: boolean
}
