import { keyInputAction } from "../.types/types.js"
import Gui from "../modules/gui.module.js"
import Input from "../modules/input.module.js"
import { Language } from "../modules/language.module.js"
import Settings from "../modules/settings.module.js"
import Timer from "../modules/timer.module.js"
import Util from "../util/general.util.js"

export default abstract class KeyBindManager {
	private static keyboardFontObserver = new MutationObserver((records) => this.renderKeyboardKeysOnChange(records))

	public static initialize(): void {
		this.PreventArrowScrollingBehaviour()
		this.renderInputKeys()
	}

	public static openSingleKeyBind(target: HTMLElement): void {
		const action = target.parentElement!.id as keyInputAction
		Gui.openWindow("keyBindModal")
		Input.toggleInput(true)
		window.addReusableEventListener("keydown", (e, reuse) => this.attemptKeyBindPress(e, target, action, reuse))
	}

	private static attemptKeyBindPress(
		keyDownEvent: KeyboardEvent,
		keyElement: HTMLElement,
		action: keyInputAction,
		reuse: () => void
	): void {
		// console.log(`${keyDownEvent.key} pressed!`)
		const ac = new AbortController()
		let timer: Timer | undefined = this.cancelKeyBindTimer(ac)
		if (keyDownEvent.key === "Escape") {
			Util.getElement("#keyBindModal .button-progress").classList.add("active")
			timer.resume()
		}
		window.addEventListener(
			"keyup",
			(e) => this.attemptKeyBindRelease(e, keyDownEvent, timer, action, keyElement, reuse, ac),
			{ signal: ac.signal }
		)
	}

	private static attemptKeyBindRelease(
		keyUpEvent: KeyboardEvent,
		keyDownEvent: KeyboardEvent,
		timer: Timer | undefined,
		action: keyInputAction,
		keyElement: HTMLElement,
		reuse: () => void,
		ac: AbortController
	): void {
		if (keyUpEvent.key !== keyDownEvent.key) return
		Util.getElement("#keyBindModal .button-progress").classList.remove("active")
		this.processKeyBind(keyUpEvent.code, action, keyElement, reuse)
		timer?.kill()
		timer = undefined
		ac.abort()
	}

	private static async processKeyBind(
		key: string,
		action: keyInputAction,
		keyElement: HTMLElement,
		reuse: () => void
	): Promise<void> {
		// console.log(`attempting to bind ${key} to ${action}!`)
		const [alreadyBoundAction, alreadyBoundKey] = this.alreadyBound(key)
		let canBind = true
		if (alreadyBoundAction) {
			const shouldOverWrite = await Util.confirmation({
				requestMessage: this.keyBindOverWriteTemplate(key, alreadyBoundAction)
			})
			if (!shouldOverWrite) {
				canBind = false
				reuse()
			} else {
				this.setKeyBind(
					Settings.keyBindings[action],
					alreadyBoundAction,
					Util.getElement(`[data-keyboard=${alreadyBoundKey}]`)
				)
			}
		}
		if (canBind) this.setKeyBind(key, action, keyElement)
		this.renderKeybinds()
		// TO-DO reload keybinds
	}

	private static keyBindOverWriteTemplate(key: string, alreadyBoundAction: keyInputAction): string {
		const keyInFont = mapCodeToKeyboardFont(key)
		return Language.get(
			"key_already_bound",
			/*html*/ `<span class="keyboard"><span>${keyInFont}</span></span>`,
			/*html*/ `<span class="action">${Language.get(alreadyBoundAction.toLowerCase())}</span>`
		)
	}

	private static alreadyBound(inputKey: string): [keyInputAction, string] | [] {
		const [alreadyBoundAction, alreadyBoundKey] =
			Object.entries(Settings.keyBindings).find(([_key, val]) => val === inputKey) ?? []
		if (alreadyBoundAction && alreadyBoundKey) return [alreadyBoundAction as keyInputAction, alreadyBoundKey]
		else return []
	}

	private static setKeyBind(key: string, action: keyInputAction, keyElement: HTMLElement): void {
		// console.log(`binding ${key} to ${action} successfull!`)
		Settings.keyBindings[action] = key
		keyElement.dataset.keyboard = key
		this.renderInputKeys()
		Settings.saveSettings()
		this.cancelKeybind()
	}

	private static cancelKeyBindTimer(ac: AbortController): Timer {
		return new Timer(() => {
			ac.abort()
			this.cancelKeybind()
			Util.getElement("#keyBindModal .button-progress").classList.remove("active")
		}, 800)
	}

	public static cancelKeybind(): void {
		Gui.closeWindow("keyBindModal")
		Input.toggleInput(false)
	}

	private static renderKeyboardKey(target: HTMLElement): void {
		const code = target.dataset.keyboard!
		target.classList.toggle("space", code === "Space")
		const fontKey = mapCodeToKeyboardFont(code)
		target.innerHTML = /*html*/ `
			<span>${fontKey}</span>
		`
	}

	private static updateKeyboardFontObserver(): void {
		Util.getAllElements("[data-keyboard]").forEach((el) =>
			this.keyboardFontObserver.observe(el, { attributes: true })
		)
	}

	private static renderKeyboardKeysOnChange(records: MutationRecord[]): void {
		// console.log(records.map(({ target }) => target))
		records.forEach((record) => {
			this.renderKeyboardKey(record.target as HTMLElement)
		})
	}

	public static renderKeybinds(): void {
		this.renderKeybindSettings()
		Util.getAllElements(".keyboard").forEach((el) => {
			const key = el.dataset.keyboard
			if (!key) return
			this.renderKeyboardKey(el)
		})
	}

	private static renderKeybindSettings(): void {
		const template = (key: string, action: string) => /*html*/ `
			<div class="row" id="${action}">
				<div class="action">${Language.get(action.toLowerCase())}</div>
				<div class="keyboard btn btn-primary border" data-click="OPEN_SINGLE_KEYBIND" data-keyboard="${key}"></div>
			</div>
		`
		const container = Util.getElement("#keybinds")
		container.innerHTML = ""
		Object.entries(Settings.keyBindings).forEach(([action, key]) => (container.innerHTML += template(key, action)))
		this.updateKeyboardFontObserver()
	}

	private static renderInputKeys(): void {
		Util.getAllElements(".btn-input").forEach(
			(el) =>
				(el.getElement(".keyboard").dataset.keyboard = Settings.keyBindings[el.dataset.click as keyInputAction])
		)
	}

	private static PreventArrowScrollingBehaviour(): void {
		const arrowKeys = ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", " "]
		window.addEventListener("keydown", (e) => {
			if (!arrowKeys.includes(e.key)) return
			e.preventDefault()
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
