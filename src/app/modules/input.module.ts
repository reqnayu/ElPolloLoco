import "../.types/prototypes.js"
import { MESSAGER } from "../../script.js"
import {
	confirmation,
	delegateEvent,
	getAllElements,
	getElement,
	pointerEventIsLeftClick
} from "../util/general.util.js"
import { keyInputAction, inputMap, mouseInputAction } from "../.types/input.type.js"
import { Timer } from "./timer.module.js"
import { audioTypes } from "../managers/sound_manager.module.js"

export class Input {
	main
	activeInputs: Set<keyInputAction | mouseInputAction> = new Set()
	activeClickInput: mouseInputAction | null = null
	isBlocked = false
	isKeyInputBlocked = true

	keyMap: inputMap<"key"> = {
		FULLSCREEN: {
			release: () => this.toggleFullscreen()
		},
		PAUSE: {
			release: () => this.togglePause()
		},
		JUMP: {
			press: () => this.jump(true),
			release: () => this.jump(false)
		},
		MOVE_LEFT: {
			press: () => this.startMove("left"),
			release: () => this.stopMove("left")
		},
		MOVE_RIGHT: {
			press: () => this.startMove("right"),
			release: () => this.stopMove("right")
		},
		THROW: {
			release: () => this.throw()
		}
	}

	clickTargetMap: inputMap<"mouse"> = {
		...this.keyMap,
		OPEN_SETTINGS: {
			release: () => this.openWindow("settings")
		},
		OPEN_KEYBIND_SETTINGS: {
			release: () => this.openKeyBindSettings()
		},
		OPEN_GAME_SETTINGS: {
			release: () => this.openWindow("game-settings")
		},
		OPEN_SINGLE_KEYBIND: {
			release: (e?: Event) => this.openSingleKeyBind(e)
		},
		OPEN_AUDIO_SETTINGS: {
			release: () => this.openAudioSettings()
		},
		CLOSE_CONTAINER: {
			release: (e?: Event) => this.closeContainer(e)
		},
		RESTART_GAME: {
			release: () => this.restartGame()
		},
		TOGGLE_SNORE: {
			release: () => this.toggleSnore()
		},
		NEW_GAME: {
			release: () => this.newGame()
		},
		RESUME_GAME: {
			release: () => this.togglePause()
		}
	}

	constructor() {
		this.main = MESSAGER.dispatch("main")
		this.initialize()
	}

	initialize(): void {
		delegateEvent("pointerdown", (e) => this.clickHandler(e))
		window.addEventListener("pointerup", (e) => this.clickHandler(e))
		window.addEventListener("keydown", (e) => this.keyHandler(e))
		window.addEventListener("keyup", (e) => this.keyHandler(e))
		this.addVolumeSliderFunctionality()
		this.addSplashScreenFunctionality()
		this.renderKeyboardKeys()
		MESSAGER.elements.set("input", this)
	}

	clickHandler(e: Event): void {
		if (!pointerEventIsLeftClick(e)) return
		const action = ((e.target as HTMLElement).closest<HTMLElement>("[data-click]") || (e.target as HTMLElement))
			?.dataset.click as mouseInputAction
		if (!action) return
		if (e.type === "pointerup" && action === this.activeClickInput && !!this.activeClickInput)
			this.clickTargetMap[this.activeClickInput]?.release?.(e)
		else if (e.type === "pointerdown") {
			this.activeClickInput = action
			this.clickTargetMap[action]?.press?.(e)
		}
	}

	private keyHandler(e: KeyboardEvent): void {
		if (this.isKeyInputBlocked) return
		// console.log(e.code)
		const isKeyDown = e.type === "keydown"
		const action = Object.entries(this.main.settings.keyBindings).find(
			([, key]) => key === e.code
		)?.[0] as keyInputAction
		if (!action) return

		if (isKeyDown && !this.activeInputs.has(action)) this.pressKey(action)
		else if (!isKeyDown && this.activeInputs.has(action)) this.releaseKey(action)

		isKeyDown ? this.activeInputs.add(action) : this.activeInputs.delete(action)
	}

	private pressKey(action: keyInputAction): void {
		this.keyMap[action].press?.()
	}

	private releaseKey(action: keyInputAction): void {
		this.keyMap[action].release?.()
	}

	// Player Actions

	private startMove(direction: "left" | "right"): void {
		if (this.isBlocked) return
		switch (direction) {
			case "left":
				this.main.player.movementBehaviour!.input.isMovingLeft = true
				break
			case "right":
				this.main.player.movementBehaviour!.input.isMovingRight = true
				break
		}
	}

	private stopMove(direction: "left" | "right"): void {
		if (this.isBlocked) return
		if (direction === "left") this.main.player.movementBehaviour!.input.isMovingLeft = false
		else if (direction === "right") this.main.player.movementBehaviour!.input.isMovingRight = false
	}

	private jump(bool: boolean): void {
		if (this.isBlocked) return
		this.main.player.movementBehaviour!.input.isJumping = bool
	}

	private throw(): void {
		if (this.isBlocked) return
		// console.log("throwing!")
		this.main.player.throwBottle()
	}

	// gui actions

	private enterMainMenu(): void {
		getElement(".splash-screen").remove()
		this.main.gui.soundBehaviour.playLooped("Menu")
	}

	private async toggleFullscreen(): Promise<void> {
		await this.main.renderer.toggleFullscreen()
	}

	openWindow(id: string): void {
		getElement(`#${id}`).classList.add("open")
	}

	closeWindow(id: string): void {
		const container = this.main.gameElement.getElement(`#${id}`)
		container.classList.remove("open")
		container.getAllElements(".open").forEach((el) => el.classList.remove("open"))
	}

	private closeContainer(e?: Event): void {
		if (!e || !(e.target instanceof HTMLElement)) return
		const id = e.target.closest(".container")!.id
		this.closeWindow(id)
		if (id === "main-menu") this.resumeGame()
	}

	private openKeyBindSettings(): void {
		const { keyBindings } = this.main.settings
		Object.entries(keyBindings).forEach(([action, key]) => {
			const keyElement = getElement(`#${action} .key`)
			if (!keyElement) return
			keyElement.innerHTML = mapCodeToKey(key)
		})
		this.openWindow("keyBindSettings")
	}

	private openSingleKeyBind(e?: Event): void {
		const target = e!.target as HTMLElement
		const action = target.parentElement!.id as keyInputAction
		this.openWindow("keyBindModal")
		this.isBlocked = true
		const ac = new AbortController()
		// window.addEventListener("keydown", (event) => this.processKeyBind(event, action, ac), { signal: ac.signal })
	}

	private openAudioSettings(): void {
		Object.entries(this.main.soundManager.volumes).forEach(
			([type, volume]) => (getElement<HTMLInputElement>(`input#${type}`).value = (volume * 100).toString())
		)
		getElement<HTMLInputElement>("input#snore").checked = !this.main.settings.snoreDisabled
		this.openWindow("audio-settings")
	}

	private async processKeyBind(
		e: KeyboardEvent,
		action: keyInputAction,
		AbortController: AbortController
	): Promise<void> {
		if (e.code === "Escape") return this.cancelKeybind(AbortController)
		this.main.settings.setKeyBind(action, e.code)
		this.closeWindow("keyBindModal")
		this.openKeyBindSettings()
		AbortController.abort()
	}

	private cancelKeybind(ac: AbortController): void {
		const timer = new Timer({
			handler: () => {
				this.closeWindow("keyBindModal")
				ac.abort()
			},
			timeout: 1000
		}).resume()
		window.addEventListener(
			"keyup",
			() => {
				timer.kill()
			},
			{ once: true, signal: ac.signal }
		)
	}

	private toggleSnore(): void {
		this.main.settings.snoreDisabled = !this.main.settings.snoreDisabled
		const isDisabled = this.main.settings.snoreDisabled
		const snoreSound = MESSAGER.dispatch("soundManager").allAudioElements.get("player/Snore")!
		isDisabled ? snoreSound.disable() : snoreSound.enable()
		this.main.settings.saveSettings()
	}

	private togglePause(): void {
		const mainMenuIsOpen = getElement("#main-menu").classList.contains("open")
		mainMenuIsOpen ? this.resumeGame() : this.pauseGame()
	}

	pauseGame(): void {
		this.openWindow("main-menu")
		getElement("[data-click='PAUSE']").classList.add("active")
		this.main.pause()
	}

	resumeGame(): void {
		this.closeWindow("main-menu")
		getElement("[data-click='PAUSE']").classList.remove("active")
		this.main.resume()
	}

	newGame(): void {
		getElement("#main-menu").classList.remove("start")
		this.main.setupNewGame()
		// this.main.startCountDown()
		this.closeWindow("main-menu")
	}

	async restartGame(): Promise<void> {
		await confirmation({
			requestMessage: "Do you want to restart? All Progress will be lost!",
			affirmMessage: "Restart",
			successCallback: () => this.newGame()
		})
	}

	private renderKeyboardKeys(): void {
		getAllElements(".keyboard span").forEach((el) => {
			const action = el.closest<HTMLElement>(".btn-input")!.dataset.click as keyInputAction
			const key = this.main.settings.keyBindings[action]
			const keyboardKey = mapCodeToKeyboardFont(key)
			el.parentElement!.classList.toggle("space", key === "Space")
			el.innerHTML = keyboardKey
		})
	}

	private addVolumeSliderFunctionality(): void {
		getAllElements<HTMLInputElement>("input[type='range']").forEach((slider) => {
			slider.addEventListener("input", (e) => {
				const type = slider.id as keyof audioTypes
				this.main.soundManager.setVolumeType(Number(slider.value) / 100, type)
			})
			slider.addEventListener("change", () => this.main.settings.saveSettings())
		})
	}

	private addSplashScreenFunctionality(): void {
		const ac = new AbortController()
		const splashScreenFunc = () => {
			this.enterMainMenu()
			ac.abort()
		}
		const eventTypes = ["click", "touchend", "keyup"]
		eventTypes.forEach((type) => window.addEventListener(type, splashScreenFunc, { signal: ac.signal }))
	}

	private saveSettings(): void {
		this.main.settings.saveSettings()
	}
}

function mapCodeToKey(code: string): string {
	if (code.startsWith("Key")) return code.slice(-1)
	if (code === "Escape") return "Esc"
	return code
}

function mapCodeToKeyboardFont(code: string): string {
	const keyboardFontMap: Record<string, string> = {
		Tab: "C",
		Space: "S",
		Escape: "Q",
		NumPad0: "?",
		NumPad1: "!",
		NumPad2: '"',
		NumPad3: "#",
		NumPad4: "$",
		NumPad5: "%",
		NumPad6: "&",
		NumPad7: "'",
		NumPad8: "(",
		NumPad9: ")",
		NumPadAdd: "*",
		ShiftLeft: "A",
		">": "<",
		ControlLeft: "D",
		ControlRight: "E",
		AltLeft: "F",
		AltRight: "G",
		ArrowLeft: "H",
		ArrowRight: "I",
		ArrowDown: "J",
		ArrowUp: "K",
		Enter: "L",
		F1: "É",
		F2: "È",
		F3: "Ê",
		F4: "Á",
		F5: "À",
		F6: "Â",
		F7: "Ú",
		F8: "Ù",
		F9: "Û",
		F10: "Ó",
		F11: "Ò",
		F12: "Ô"
	}
	if (code.startsWith("Key")) return code.slice(3).toLowerCase()
	return keyboardFontMap[code] || code
}
