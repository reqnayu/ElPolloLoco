import { MESSAGER } from "../../script.js"
import { keyInputAction } from "../.types/input.type.js"
import { Input } from "../modules/input.module.js"
import { Timer } from "../modules/timer.module.js"
import { capitalizeFirstLetter, confirmation, getAllElements, getElement } from "../util/general.util.js"

export class KeyBindManager {
	private settings
	private keyboardFontObserver = new MutationObserver((records) => this.renderKeyboardKeysOnChange(records))

	constructor(private input: Input) {
		this.settings = MESSAGER.dispatch("main").settings
		this.PreventArrowScrollingBehaviour()
		this.renderKeybinds()
		this.renderInputKeys()
		// this.renderKeyBindings()
	}

	openSingleKeyBind(target: HTMLElement): void {
		const action = target.parentElement!.id as keyInputAction
		this.input.openWindow("keyBindModal")
		this.input.isBlocked = true
		window.addReusableEventListener("keydown", (e, reuse) => this.attemptKeyBindPress(e, target, action, reuse))
	}

	private attemptKeyBindPress(
		keyDownEvent: KeyboardEvent,
		keyElement: HTMLElement,
		action: keyInputAction,
		reuse: () => void
	): void {
		// console.log(`${keyDownEvent.key} pressed!`)
		const ac = new AbortController()
		let timer: Timer | undefined = this.cancelKeyBindTimer(ac)
		if (keyDownEvent.key === "Escape") {
			getElement("#keyBindModal .button-progress").classList.add("active")
			timer.resume()
		}
		window.addEventListener(
			"keyup",
			(e) => this.attemptKeyBindRelease(e, keyDownEvent, timer, action, keyElement, reuse, ac),
			{ signal: ac.signal }
		)
	}

	private attemptKeyBindRelease(
		keyUpEvent: KeyboardEvent,
		keyDownEvent: KeyboardEvent,
		timer: Timer | undefined,
		action: keyInputAction,
		keyElement: HTMLElement,
		reuse: () => void,
		ac: AbortController
	): void {
		if (keyUpEvent.key !== keyDownEvent.key) return
		getElement("#keyBindModal .button-progress").classList.remove("active")
		this.processKeyBind(keyUpEvent.code, action, keyElement, reuse)
		timer?.kill()
		timer = undefined
		ac.abort()
	}

	private async processKeyBind(
		key: string,
		action: keyInputAction,
		keyElement: HTMLElement,
		reuse: () => void
	): Promise<void> {
		// console.log(`attempting to bind ${key} to ${action}!`)
		const [alreadyBoundAction, alreadyBoundKey] = this.alreadyBound(key)
		let canBind = true
		if (alreadyBoundAction) {
			const shouldOverWrite = await confirmation({
				requestMessage: this.keyBindOverWriteTemplate(key, alreadyBoundAction)
			})
			if (!shouldOverWrite) {
				canBind = false
				reuse()
			} else {
				this.setKeyBind(
					this.settings.keyBindings[action],
					alreadyBoundAction,
					getElement(`[data-keyboard=${alreadyBoundKey}]`)
				)
			}
		}
		if (canBind) this.setKeyBind(key, action, keyElement)
	}

	private keyBindOverWriteTemplate(key: string, alreadyBoundAction: keyInputAction): string {
		const keyInFont = mapCodeToKeyboardFont(key)
		const readableAction = mapActionToReadable(alreadyBoundAction)
		return /*html*/ `
			<span class="key">${keyInFont}</span> is already bound to <span class="action">${readableAction}</span>. Do you want to overwrite it?
		`
	}

	private alreadyBound(inputKey: string): [keyInputAction, string] | [] {
		const [alreadyBoundAction, alreadyBoundKey] =
			Object.entries(this.settings.keyBindings).find(([_key, val]) => val === inputKey) ?? []

		if (alreadyBoundAction && alreadyBoundKey) return [alreadyBoundAction as keyInputAction, alreadyBoundKey]
		else return []
	}

	private setKeyBind(key: string, action: keyInputAction, keyElement: HTMLElement): void {
		// console.log(`binding ${key} to ${action} successfull!`)
		this.settings.keyBindings[action] = key
		keyElement.dataset.keyboard = key
		this.renderInputKeys()
		this.settings.saveSettings()
		this.cancelKeybind()
	}

	private cancelKeyBindTimer(ac: AbortController): Timer {
		return new Timer({
			handler: () => {
				ac.abort()
				this.cancelKeybind()
				getElement("#keyBindModal .button-progress").classList.remove("active")
			},
			timeout: 800
		})
	}

	cancelKeybind(): void {
		this.input.closeWindow("keyBindModal")
		this.input.isBlocked = false
	}

	private renderKeyboardKey(target: HTMLElement): void {
		const code = target.dataset.keyboard!
		target.classList.toggle("space", code === "Space")
		const fontKey = mapCodeToKeyboardFont(code)
		target.innerHTML = /*html*/ `
			<span>${fontKey}</span>
		`
	}

	private updateKeyboardFontObserver(): void {
		getAllElements("[data-keyboard]").forEach((el) => this.keyboardFontObserver.observe(el, { attributes: true }))
	}

	private renderKeyboardKeysOnChange(records: MutationRecord[]): void {
		// console.log(records.map(({ target }) => target))
		records.forEach((record) => {
			this.renderKeyboardKey(record.target as HTMLElement)
		})
	}

	private renderKeybinds(): void {
		this.renderKeybindSettings()
		getAllElements(".keyboard").forEach((el) => {
			const key = el.dataset.keyboard
			if (!key) return
			this.renderKeyboardKey(el)
		})
	}

	private renderKeybindSettings(): void {
		const template = (key: string, action: string) => /*html*/ `
			<div class="row" id="${action}">
				<div class="action">${mapActionToReadable(action as keyInputAction)}</div>
				<div class="keyboard btn btn-primary" data-click="OPEN_SINGLE_KEYBIND" data-keyboard="${key}"></div>
			</div>
		`
		const { keyBindings } = MESSAGER.dispatch("main").settings
		const container = getElement("#keybinds")
		container.innerHTML = ""
		Object.entries(keyBindings).forEach(([action, key]) => (container.innerHTML += template(key, action)))
		this.updateKeyboardFontObserver()
	}

	private renderInputKeys(): void {
		getAllElements(".btn-input").forEach(
			(el) =>
				(el.getElement(".keyboard").dataset.keyboard =
					this.settings.keyBindings[el.dataset.click as keyInputAction])
		)
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
