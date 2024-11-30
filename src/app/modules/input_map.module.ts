import { inputMap } from "../.types/types.js"
import KeyBindManager from "../managers/keybind.manager.js"
import Gui from "./gui.module.js"
import Input from "./input.module.js"

export abstract class InputMap {
	public static keyMap: inputMap<"key"> = {
		FULLSCREEN: {
			release: () => Input.toggleFullscreen()
		},
		PAUSE: {
			release: () => Input.togglePause()
		},
		JUMP: {
			press: () => Input.jump(true),
			release: () => Input.jump(false)
		},
		MOVE_LEFT: {
			press: () => Input.startMove("left"),
			release: () => Input.stopMove("left")
		},
		MOVE_RIGHT: {
			press: () => Input.startMove("right"),
			release: () => Input.stopMove("right")
		},
		THROW: {
			release: () => Input.throw()
		}
	}

	static clickTargetMap: inputMap<"mouse"> = {
		...this.keyMap,
		OPEN_SETTINGS: {
			release: () => Gui.openWindow("settings")
		},
		OPEN_KEYBIND_SETTINGS: {
			release: () => Input.openKeyBindSettings()
		},
		OPEN_GAME_SETTINGS: {
			release: () => Input.openGameSettings()
		},
		OPEN_SINGLE_KEYBIND: {
			release: (target) => KeyBindManager.openSingleKeyBind(target)
		},
		CANCEL_KEYBIND: {
			release: () => KeyBindManager.cancelKeybind()
		},
		OPEN_AUDIO_SETTINGS: {
			release: () => Input.openAudioSettings()
		},
		CLOSE_CONTAINER: {
			release: (target) => Input.closeContainer(target)
		},
		RESTART_GAME: {
			release: () => Input.restartGame()
		},
		TOGGLE_SNORE: {
			release: () => Input.toggleSnore()
		},
		CHANGE_LANGUAGE: {
			release: (target) => Input.changeLanguage(target)
		},
		TOGGLE_FPS: {
			release: () => Input.toggleFps()
		},
		NEW_GAME: {
			release: () => Input.newGame()
		},
		MAIN_MENU: {
			release: () => Input.backToMainMenu()
		},
		IMPRINT: {
			release: () => Input.openImprint()
		},
		RESUME_GAME: {
			release: () => Input.togglePause()
		},
		BUY_HEALTH: {
			release: () => Input.buyHealth()
		},
		BUY_BOTTLE: {
			release: () => Input.buyBottle()
		}
	}
}
