import { keyInputAction } from "../.types/types.js"
import Gui from "../modules/gui.module.js"
import Input from "../modules/input.module.js"
import Language from "../modules/language.module.js"
import Settings from "../modules/settings.module.js"
import Timer from "../modules/timer.module.js"
import Util from "../util/general.util.js"

/**
 * KeyBindManager is responsible for handling key binding functionality,
 * allowing users to customize, view, and update key bindings for different actions.
 */
export default abstract class KeyBindManager {
  /** MutationObserver to observe changes in keyboard key elements */
  private static keyboardFontObserver = new MutationObserver((records) => this.renderKeyboardKeysOnChange(records))

  /**
   * Initializes the KeyBindManager by rendering key bindings and preventing default arrow key scrolling behavior.
   */
  public static initialize(): void {
    this.PreventArrowScrollingBehaviour()
    this.renderInputKeys()
    this.renderKeybinds()
  }

  /**
   * Opens the key binding modal for a single action and listens for a key press to bind it.
   *
   * @param {HTMLElement} target - The target HTML element that was clicked to open the key bind modal.
   */
  public static openSingleKeyBind(target: HTMLElement): void {
    const action = target.parentElement!.id as keyInputAction
    Gui.openWindow("keyBindModal")
    Input.toggleInput(true)
    window.addReusableEventListener("keydown", (e, reuse) => this.attemptKeyBindPress(e, target, action, reuse))
  }

  /**
   * Attempts to bind a key when the user presses a key during the key bind process.
   *
   * @param {KeyboardEvent} keyDownEvent - The key down event triggered by the user's key press.
   * @param {HTMLElement} keyElement - The HTML element representing the key in the UI.
   * @param {keyInputAction} action - The action associated with the key being bound.
   * @param {Function} reuse - Function to reuse the event listener if necessary.
   */
  private static attemptKeyBindPress(
    keyDownEvent: KeyboardEvent,
    keyElement: HTMLElement,
    action: keyInputAction,
    reuse: () => void
  ): void {
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

  /**
   * Handles the key release event and finalizes the key binding process.
   *
   * @param {KeyboardEvent} keyUpEvent - The key up event triggered when the user releases the key.
   * @param {KeyboardEvent} keyDownEvent - The initial key down event triggered when the key was pressed.
   * @param {Timer | undefined} timer - A timer to manage the key binding process.
   * @param {keyInputAction} action - The action associated with the key being bound.
   * @param {HTMLElement} keyElement - The HTML element representing the key in the UI.
   * @param {Function} reuse - Function to reuse the event listener if necessary.
   * @param {AbortController} ac - The AbortController used to abort the event listener when necessary.
   */
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

  /**
   * Processes the key binding and handles any conflicts if the key is already bound to another action.
   *
   * @param {string} key - The key code to bind.
   * @param {keyInputAction} action - The action to bind the key to.
   * @param {HTMLElement} keyElement - The HTML element representing the key in the UI.
   * @param {Function} reuse - Function to reuse the event listener if necessary.
   */
  private static async processKeyBind(
    key: string,
    action: keyInputAction,
    keyElement: HTMLElement,
    reuse: () => void
  ): Promise<void> {
    const [alreadyBoundAction, alreadyBoundKey] = this.alreadyBound(key)
    let canBind = true
    if (alreadyBoundAction) {
      const shouldOverWrite = await Util.confirmation({
        requestMessage: this.keyBindOverWriteTemplate(key, alreadyBoundAction),
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
  }

  /**
   * Creates a confirmation message template when trying to overwrite an existing key binding.
   *
   * @param {string} key - The key to bind.
   * @param {keyInputAction} alreadyBoundAction - The action that is already bound to the key.
   * @returns {string} - The confirmation message template.
   */
  private static keyBindOverWriteTemplate(key: string, alreadyBoundAction: keyInputAction): string {
    const keyInFont = mapCodeToKeyboardFont(key)
    return Language.get(
      "key_already_bound",
      /*html*/ `<span class="keyboard"><span>${keyInFont}</span></span>`,
      /*html*/ `<span class="action">${Language.get(alreadyBoundAction.toLowerCase())}</span>`
    )
  }

  /**
   * Checks if a key is already bound to another action.
   *
   * @param {string} inputKey - The key code to check.
   * @returns {[keyInputAction, string] | []} - A tuple with the bound action and key, or an empty array if not bound.
   */
  private static alreadyBound(inputKey: string): [keyInputAction, string] | [] {
    const [alreadyBoundAction, alreadyBoundKey] =
      Object.entries(Settings.keyBindings).find(([_key, val]) => val === inputKey) ?? []
    if (alreadyBoundAction && alreadyBoundKey) return [alreadyBoundAction as keyInputAction, alreadyBoundKey]
    else return []
  }

  /**
   * Sets a key binding for an action and updates the UI.
   *
   * @param {string} key - The key code to bind.
   * @param {keyInputAction} action - The action to bind the key to.
   * @param {HTMLElement} keyElement - The HTML element representing the key in the UI.
   */
  private static setKeyBind(key: string, action: keyInputAction, keyElement: HTMLElement): void {
    Settings.keyBindings[action] = key
    keyElement.dataset.keyboard = key
    this.renderInputKeys()
    Settings.saveSettings()
    this.cancelKeybind()
  }

  /**
   * Creates a timer to cancel the key binding process if the user takes too long.
   *
   * @param {AbortController} ac - The AbortController used to abort the key binding process.
   * @returns {Timer} - The created timer instance.
   */
  private static cancelKeyBindTimer(ac: AbortController): Timer {
    return new Timer(() => {
      ac.abort()
      this.cancelKeybind()
      Util.getElement("#keyBindModal .button-progress").classList.remove("active")
    }, 800)
  }

  /**
   * Cancels the key binding process and closes the modal.
   */
  public static cancelKeybind(): void {
    Gui.closeWindow("keyBindModal")
    Input.toggleInput(false)
  }

  /**
   * Renders the HTML representation of a key in the keyboard UI.
   *
   * @param {HTMLElement} target - The target HTML element representing the key.
   */
  private static renderKeyboardKey(target: HTMLElement): void {
    const code = target.dataset.keyboard!
    target.classList.toggle("space", code === "Space")
    const fontKey = mapCodeToKeyboardFont(code)
    target.innerHTML = /*html*/ `
			<span>${fontKey}</span>
		`
  }

  /**
   * Observes changes to keyboard key elements and updates their display when changed.
   */
  private static updateKeyboardFontObserver(): void {
    Util.getAllElements("[data-keyboard]").forEach((el) =>
      this.keyboardFontObserver.observe(el, { attributes: true })
    )
  }

  /**
   * Handles changes in keyboard keys by re-rendering the corresponding key.
   *
   * @param {MutationRecord[]} records - The mutation records generated by the observer.
   */
  private static renderKeyboardKeysOnChange(records: MutationRecord[]): void {
    records.forEach((record) => {
      this.renderKeyboardKey(record.target as HTMLElement)
    })
  }

  /**
   * Renders all key bindings and updates the UI to reflect the current bindings.
   */
  public static renderKeybinds(): void {
    this.renderKeybindSettings()
    Util.getAllElements(".keyboard").forEach((el) => {
      const key = el.dataset.keyboard
      if (!key) return
      this.renderKeyboardKey(el)
    })
  }

  /**
   * Renders the key binding settings UI.
   */
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

  /**
   * Renders the input keys based on the current key bindings.
   */
  private static renderInputKeys(): void {
    Util.getAllElements(".btn-input").forEach(
      (el) =>
        (el.getElement(".keyboard").dataset.keyboard = Settings.keyBindings[el.dataset.click as keyInputAction])
    )
  }

  /**
   * Prevents the default behavior of arrow keys and spacebar to avoid scrolling the page.
   */
  private static PreventArrowScrollingBehaviour(): void {
    const arrowKeys = ["ArrowLeft", "ArrowDown", "ArrowRight", "ArrowUp", " "]
    window.addEventListener("keydown", (e) => {
      if (!arrowKeys.includes(e.key)) return
      e.preventDefault()
    })
  }
}

/**
 * Maps a key code to its key name.
 *
 * @param {string} code - The key code to map.
 * @returns {string} - The corresponding key name.
 */
function mapCodeToKey(code: string): string {
  if (code.startsWith("Key")) return code.slice(-1)
  if (code === "Escape") return "Esc"
  return code
}

/**
 * Maps a key code to its corresponding representation in a custom font.
 *
 * @param {string} code - The key code to map.
 * @returns {string} - The keyboard font representation of the key.
 */
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
    F12: "Ô",
  }
  if (code.startsWith("Key")) return code.slice(3).toLowerCase()
  return keyboardFontMap[code] || code
}
