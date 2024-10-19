import { MESSAGER } from "../../script.js"
import { keyInputAction } from "../.types/input.type.js"
import { Input } from "../modules/input.module.js"
import { Timer } from "../modules/timer.module.js"
import { capitalizeFirstLetter, confirmation, getAllElements, getElement } from "../util/general.util.js"

export class KeyBindManager {
	private settings
	constructor(private input: Input) {
		this.settings = MESSAGER.dispatch("main").settings
		this.PreventArrowScrollingBehaviour()
		this.renderKeyBindings()
		this.renderKeyboardKeys()
	}

	openSingleKeyBind(e: Event): void {
		const target = e.target as HTMLElement
		const action = target.parentElement!.id as keyInputAction
		this.input.openWindow("keyBindModal")
		this.input.isBlocked = true
		window.addReusableEventListener("keydown", (e, reuse) => this.attemptKeyBind(e, action, reuse))
	}

	private attemptKeyBind(keyDownEvent: KeyboardEvent, action: keyInputAction, reuse: () => void): void {
		console.log(`${keyDownEvent.key} pressed!`)
		const ac = new AbortController()
		let timer: Timer | undefined = this.cancelKeyBindTimer(ac)
		if (keyDownEvent.key === "Escape") timer.resume()
		window.addEventListener(
			"keyup",
			(keyUpEvent) => {
				if (keyUpEvent.key !== keyDownEvent.key) return
				this.processKeyBind(keyUpEvent.code, action, reuse)
				timer?.kill()
				timer = undefined
				ac.abort()
			},
			{ signal: ac.signal }
		)
	}

	private async processKeyBind(key: string, action: keyInputAction, reuse: () => void): Promise<void> {
		console.log(`attempting to bind ${key} to ${action}!`)
		const [alreadyBoundAction, alreadyBoundKey] = this.alreadyBound(key)
		let canBind = true
		if (alreadyBoundAction) {
			const shouldOverWrite = await confirmation({
				requestMessage: /*html*/ `<span class="key">${mapCodeToKeyboardFont(
					key
				)}</span> is already bound to <span class="action">${mapActionToReadable(
					alreadyBoundAction
				)}</span>. Do you want to overwrite it?`
			})
			if (!shouldOverWrite) {
				canBind = false
				reuse()
			} else {
				this.setKeyBind(this.settings.keyBindings[action], alreadyBoundAction)
			}
		}
		if (canBind) this.setKeyBind(key, action)
	}

	private alreadyBound(inputKey: string): [keyInputAction, string] | [] {
		const [alreadyBoundAction, alreadyBoundKey] =
			Object.entries(this.settings.keyBindings).find(([_key, val]) => val === inputKey) ?? []

		if (alreadyBoundAction && alreadyBoundKey) return [alreadyBoundAction as keyInputAction, alreadyBoundKey]
		else return []
	}

	private setKeyBind(key: string, action: keyInputAction): void {
		console.log(`binding ${key} to ${action} successfull!`)
		this.settings.keyBindings[action] = key
		this.settings.saveSettings()
		this.renderKeyBindings()
		this.renderKeyboardKeys()
		this.cancelKeybind()
	}

	private cancelKeyBindTimer(ac: AbortController): Timer {
		return new Timer({
			handler: () => {
				ac.abort()
				this.cancelKeybind()
			},
			timeout: 1000
		})
	}

	private cancelKeybind(): void {
		this.input.closeWindow("keyBindModal")
		this.input.isBlocked = false
	}

	private renderKeyBindings(): void {
		const { keyBindings } = this.settings
		Object.entries(keyBindings).forEach(([action, key]) => {
			const keyElement = getElement(`#${action} .key span`)
			if (!keyElement) return
			keyElement.innerHTML = mapCodeToKeyboardFont(key)
		})
	}

	private renderKeyboardKeys(): void {
		getAllElements(".keyboard span").forEach((el) => {
			const action = el.closest<HTMLElement>(".btn-input")!.dataset.click as keyInputAction
			const key = this.settings.keyBindings[action]
			const keyboardKey = mapCodeToKeyboardFont(key)
			el.parentElement?.classList.toggle("space", key === "Space")
			el.innerHTML = keyboardKey
		})
	}

	private PreventArrowScrollingBehaviour(): void {
		const arrowKeys = ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", " "]
		window.addEventListener("keydown", (e) => {
			if (!arrowKeys.includes(e.key)) return
			e.preventDefault()
		})
	}
}

function mapActionToReadable(action: keyInputAction): string {
	return action
		.split("_")
		.map((word) => capitalizeFirstLetter(word))
		.join(" ")
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
