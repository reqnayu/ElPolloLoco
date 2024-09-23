import { MESSAGER } from "../../script.js"
import { confirmation, delegateEvent } from "../util/general.util.js"
import { keyInputAction, inputMap, mouseInputAction } from "../.types/input.type.js"
import { Timer } from "./timer.module.js"

export class Input {
	main
	activeInputs: Set<keyInputAction | mouseInputAction> = new Set()
	activeClickInput: mouseInputAction | null = null
	isBlocked = false

	keyMap: inputMap<"key"> = {
		FULLSCREEN: {
			press: () => this.toggleFullscreen()
		},
		PAUSE: {
			press: () => this.main.togglePause()
		},
		JUMP: {
			press: () => this.main.player.movementBehaviour?.jump()
		},
		MOVE_LEFT: {
			press: () => this.startMove("left"),
			release: () => this.stopMove()
		},
		MOVE_RIGHT: {
			press: () => this.startMove("right"),
			release: () => this.stopMove()
		},
		THROW: {
			press: () => this.throw()
		}
	}

	clickTargetMap: inputMap<"mouse"> = {
		...this.keyMap,
		OPEN_SETTINGS: {
			press: () => this.openWindow("settings")
		},
		OPEN_KEYBIND_SETTINGS: {
			press: () => this.openKeyBindSettings()
		},
		OPEN_SINGLE_KEYBIND: {
			press: (e?: Event) => this.openSingleKeyBind(e)
		},
		CLOSE_CONTAINER: {
			press: (e?: Event) => this.closeContainer(e)
		},
		RESTART_GAME: {
			press: () => this.restartGame()
		}
	}

	constructor() {
		this.main = MESSAGER.dispatch("main")
		this.initialize()
		this.renderKeyboardKeys()
	}

	initialize(): void {
		delegateEvent("pointerdown", (e) => this.clickHandler(e))
		window.addEventListener("pointerup", (e) => this.clickHandler(e))
		window.addEventListener("keydown", (e) => this.keyHandler(e))
		window.addEventListener("keyup", (e) => this.keyHandler(e))
		MESSAGER.elements.set("input", this)
	}

	clickHandler(e: Event): void {
		if (!((e as PointerEvent).which === 1)) return
		if (e.type === "pointerup" && !!this.activeClickInput)
			return this.clickTargetMap[this.activeClickInput!].release?.()
		Object.entries(this.clickTargetMap).forEach(([action, { press: callback }]) => {
			if (!(e.target instanceof HTMLElement)) return
			const attr = e.target.dataset.click
			if (!attr || attr !== action) return
			callback(e)
			this.activeClickInput = action as mouseInputAction
		})
	}

	private keyHandler(e: KeyboardEvent): void {
		console.log(e.code)
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
		this.keyMap[action].press()
	}

	private releaseKey(action: keyInputAction): void {
		this.keyMap[action].release?.()
	}

	private startMove(direction: "left" | "right"): void {
		switch (direction) {
			case "left":
				this.main.player.input.isMovingLeft = true
				break
			case "right":
				this.main.player.input.isMovingRight = true
				break
		}
	}

	private stopMove(): void {
		this.main.player.input.isMovingLeft = false
		this.main.player.input.isMovingRight = false
	}

	private async toggleFullscreen(): Promise<void> {
		await this.main.renderer.toggleFullscreen()
		document.querySelector("button.fullscreen")!.classList.toggle("active")
	}

	private throw(): void {
		console.log("throwing!")
	}

	openWindow(id: string): void {
		this.main.gameElement.querySelector(`#${id}`)!.classList.add("open")
	}

	closeWindow(id: string): void {
		const container = this.main.gameElement.querySelector(`#${id}`)!
		container.classList.remove("open")
		container.querySelectorAll(".open").forEach((el) => el.classList.remove("open"))
	}

	private closeContainer(e?: Event): void {
		if (!e || !(e.target instanceof HTMLElement)) return
		const id = e.target.closest(".container")!.id
		this.closeWindow(id)
		if (id === "pause-screen") this.main.togglePause()
	}

	private openKeyBindSettings(): void {
		const { keyBindings } = this.main.settings
		Object.entries(keyBindings).forEach(([action, key]) => {
			const keyElement = document.querySelector(`#${action} .key`)
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
		window.addEventListener("keydown", (event) => this.processKeyBind(event, action, ac), { signal: ac.signal })
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
		const timer = new Timer(() => {
			this.closeWindow("keyBindModal")
			ac.abort()
		}, 1000).resume()
		window.addEventListener(
			"keyup",
			() => {
				timer.kill()
			},
			{ once: true, signal: ac.signal }
		)
	}

	pauseGame(): void {
		this.openWindow("pause-screen")
		document.querySelector("[data-click='PAUSE']")?.classList.add("active")
	}

	resumeGame(): void {
		this.closeWindow("pause-screen")
		document.querySelector("[data-click='PAUSE']")?.classList.remove("active")
	}

	async restartGame(): Promise<void> {
		await confirmation({
			requestMessage: "Do you want to restart? All Progress will be lost!",
			affirmMessage: "Restart",
			successCallback: () => {
				console.log("restarting")
			}
		})
	}

	private renderKeyboardKeys(): void {
		document.querySelectorAll<HTMLElement>(".keyboard span").forEach((el) => {
			const action = el.closest<HTMLElement>(".btn-input")!.dataset.click as keyInputAction
			const key = this.main.settings.keyBindings[action]
			const keyboardKey = mapCodeToKeyboardFont(key)
			el.parentElement!.classList.toggle("space", key === "Space")
			el.innerHTML = keyboardKey
		})
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
