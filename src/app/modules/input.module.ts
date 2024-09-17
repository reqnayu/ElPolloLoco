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

	toggleKeyHandler(event: KeyboardEvent): void {
		// if (this.isBlocked) return
		// const action = Object.entries(this.main.settings.keyBindings).find(
		// 	([action, key]) => this.toggleKeyMap.has(action) && key === event.code
		// )?.[0]
		// if (!action) return
		// console.log(action)
		// this.toggleKeyMap.get(action)?.()
	}

	holdKeyHandler(event: KeyboardEvent): void {
		if (this.isBlocked) return
		const action = Object.entries(this.main.settings.keyBindings).find(([action, key]) => key === event.code)?.[0]
		if (!action) return
		const isKeyDown = event.type === "keydown"
		console.log(action, isKeyDown)
		return

		// const { keyBindings } = this.main.settings
		// if (!Object.values(keyBindings).includes(event.code)) return
		// const isKeyDown = event.type === "keydown"
		// if (this.activeInputs.has(event.code) === isKeyDown) return

		// isKeyDown ? this.activeInputs.add(event.code) : this.activeInputs.delete(event.code)
		// const { input } = MESSAGER.dispatch("main").player
		// switch (event.code) {
		// 	case keyBindings.MOVE_LEFT:
		// 		input.isMovingLeft = isKeyDown
		// 		break
		// 	case keyBindings.MOVE_RIGHT:
		// 		input.isMovingRight = isKeyDown
		// 		break
		// 	case keyBindings.JUMP:
		// 		input.isJumping = isKeyDown
		// 		break
		// }
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

	private openWindow(id: string): void {
		this.main.gameElement.querySelector(`#${id}`)!.classList.add("open")
	}

	private closeWindow(id: string): void {
		this.main.gameElement.querySelector(`#${id}`)!.classList.remove("open")
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

	private mobileInput(input: keyInputAction): void {
		const { keyBindings } = this.main.settings
		const e = new KeyboardEvent("keydown", {
			code: keyBindings[input]
		})
		window.dispatchEvent(e)
	}
}

function mapCodeToKey(code: string): string {
	if (code.startsWith("Key")) return code.slice(-1)
	if (code === "Escape") return "Esc"
	return code
}
