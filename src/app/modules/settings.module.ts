import { MESSAGER } from "../../script.js"
import { keyInputAction } from "../.types/input.type.js"
import { audioTypes } from "../managers/sound_manager.module.js"

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

	constructor() {
		this.main = MESSAGER.dispatch("main")
		this.loadSettings()
	}

	async setKeyBind(action: keyof typeof this.keyBindings, key: string): Promise<void> {
		this.keyBindings[action] = key
	}

	keyBindExists(key: string): boolean {
		return this.keyBindings.hasOwnProperty(key)
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
