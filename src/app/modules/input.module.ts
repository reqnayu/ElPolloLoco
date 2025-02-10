import "../.types/prototypes.js"
import {
  keyInputAction,
  mouseInputAction,
  audioTypes,
  lang,
  resourceAmountParams,
  inputValue,
} from "../.types/types.js"
import Util from "../util/general.util.js"
import SoundManager from "../managers/sound.manager.js"
import KeyBindManager from "../managers/keybind.manager.js"
import Settings from "./settings.module.js"
import Main from "./main.module.js"
import Gui from "./gui.module.js"
import Renderer from "./renderer.module.js"
import Language from "./language.module.js"
import InputMap from "./input_map.module.js"

/**
 * Handles player input and game interactions, including keyboard and mouse actions.
 */
export default abstract class Input {
  /** @type {Set<keyInputAction | mouseInputAction>} Set of currently active inputs */
  private static activeInputs: Set<keyInputAction | mouseInputAction> = new Set()

  /** @type boolean Determines if player input is blocked */
  public static isPlayerInputBlocked = true

  /** @type {boolean} Determines if all input is blocked */
  private static isBlocked = true

  /**
   * Toggles the input blocking state.
   * @param {boolean} [bool] - Optional boolean to explicitly set the blocking state.
   * @returns {boolean} - The current blocking state.
   */
  public static toggleInput(bool?: boolean): boolean {
    if (bool !== undefined) this.isBlocked = !bool
    else this.isBlocked = !this.isBlocked
    return this.isBlocked
  }

  /**
   * Toggles the player input blocking state.
   * @param {boolean} [bool] - Optional boolean to explicitly set the blocking state.
   * @returns {boolean} - The current player input blocking state.
   */
  public static togglePlayerInput(bool?: boolean): boolean {
    if (bool !== undefined) this.isPlayerInputBlocked = !bool
    else this.isPlayerInputBlocked = !this.isPlayerInputBlocked
    return this.isPlayerInputBlocked
  }

  /**
   * Initializes input listeners and sets up functionality for additional components.
   */
  public static initialize(): void {
    KeyBindManager.initialize()
    window.addEventListener("pointerdown", (e) => this.clickHandler(e))
    window.addEventListener("keydown", (e) => this.keyHandler(e))
    window.addEventListener("keyup", (e) => this.keyHandler(e))
    this.addVolumeSliderFunctionality()
    this.addSplashScreenFunctionality()
    this.addScreenOrientationFunctionality()
  }

  /**
   * Handles click events and maps them to actions based on data attributes.
   * @param {Event} e - The click event.
   */
  private static clickHandler(e: Event): void {
    if (!Util.pointerEventIsLeftClick(e)) return
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-click]")
    const action = target?.dataset.click
    if (!action) return
    const clickFunc = InputMap.clickTargetMap[action]
    clickFunc?.press?.(target)
    const ac = new AbortController()
    if (target.closest("footer") && target.classList.contains("btn-input"))
      this.addPointerLeaveListener(clickFunc, target, ac)
    this.addPointerUpListener(action as keyInputAction, clickFunc, target, ac)
  }

  /**
   * Adds a "pointerleave" event listener to the target element.
   * @param {inputValue} clickFunc - An object that may contain a `release` method.
   * @param {HTMLElement} target - The target element to listen for the pointer leave event.
   * @param {AbortController} ac - The AbortController to manage event listener cleanup.
   */
  private static addPointerLeaveListener(clickFunc: inputValue, target: HTMLElement, ac: AbortController): void {
    target.addEventListener(
      "pointerleave",
      (e) => {
        clickFunc?.release?.(target)
        ac.abort()
      },
      { signal: ac.signal }
    )
  }

  /**
   * Adds a "pointerup" event listener to the window.
   * @param {keyInputAction} action - The action identifier used to match elements via the `data-click` attribute.
   * @param {inputValue} clickFunc - An object that may contain a `release` method.
   * @param {HTMLElement} target - The target element to check against the event.
   * @param {AbortController} ac - The AbortController to manage event listener cleanup.
   */
  private static addPointerUpListener(
    action: keyInputAction,
    clickFunc: inputValue,
    target: HTMLElement,
    ac: AbortController
  ): void {
    window.addEventListener(
      "pointerup",
      (e) => {
        if (e.target === target || (e.target as HTMLElement).closest(`[data-click="${action}"]`))
          clickFunc?.release?.(target)
      },
      { once: true, signal: ac.signal }
    )
  }

  /**
   * Handles key events (keydown and keyup) and triggers respective actions.
   * @param {KeyboardEvent} e - The key event.
   */
  private static keyHandler(e: KeyboardEvent): void {
    if (this.isBlocked) return
    const isKeyDown = e.type === "keydown"
    const action = Object.entries(Settings.keyBindings).find(([, key]) => key === e.code)?.[0] as keyInputAction
    if (!action) return

    if (isKeyDown && !this.activeInputs.has(action)) this.pressKey(action)
    else if (!isKeyDown && this.activeInputs.has(action)) this.releaseKey(action)

    isKeyDown ? this.activeInputs.add(action) : this.activeInputs.delete(action)
  }

  /**
   * Triggers the press action for a specific key input.
   * @param {keyInputAction} action - The key action to press.
   */
  private static pressKey(action: keyInputAction): void {
    InputMap.keyMap[action].press?.(document.documentElement)
  }

  /**
   * Triggers the release action for a specific key input.
   * @param {keyInputAction} action - The key action to release.
   */
  private static releaseKey(action: keyInputAction): void {
    InputMap.keyMap[action].release?.(document.documentElement)
  }

  /**
   * Starts player movement in the specified direction.
   * @param {"left" | "right"} direction - The direction to move.
   */
  public static startMove(direction: "left" | "right"): void {
    if (this.isPlayerInputBlocked) return
    switch (direction) {
      case "left":
        Main.player.movementBehaviour!.input.isMovingLeft = true
        break
      case "right":
        Main.player.movementBehaviour!.input.isMovingRight = true
        break
    }
  }

  /**
   * Stops player movement in the specified direction.
   * @param {"left" | "right"} direction - The direction to stop moving.
   */
  public static stopMove(direction: "left" | "right"): void {
    if (this.isPlayerInputBlocked) return
    if (direction === "left") Main.player.movementBehaviour!.input.isMovingLeft = false
    else if (direction === "right") Main.player.movementBehaviour!.input.isMovingRight = false
  }

  /**
   * Makes the player character jump.
   * @param {boolean} bool - Whether to jump or not.
   */
  public static jump(bool: boolean): void {
    if (this.isPlayerInputBlocked) return
    Main.player.movementBehaviour!.input.isJumping = bool
  }

  /**
   * Throws an item (e.g., a bottle) from the player character.
   */
  public static throw(): void {
    if (this.isPlayerInputBlocked) return
    Main.player.throwBottle()
  }

  /**
   * Buys health for the player character.
   */
  public static buyHealth(): void {
    this.buyResource("healthPoints", Settings.itemCosts.healthPoints, 50)
  }

  /**
   * Buys a bottle for the player character.
   */
  public static buyBottle(): void {
    this.buyResource("bottles", Settings.itemCosts.bottles)
  }

  /**
   * Generic function to buy a resource for the player character.
   * @param {keyof resourceAmountParams} type - The type of resource to buy.
   * @param {number} cost - The cost of the resource.
   * @param {number} [amount=1] - The amount of resource to add.
   */
  private static buyResource(type: keyof resourceAmountParams, cost: number, amount = 1): void {
    const resourceBehaviour = Main.player.resourceBehaviour!
    if (resourceBehaviour[type]!.fraction === 1) return resourceBehaviour[type]!.emptyUse()
    if (resourceBehaviour.use("coins", cost) === false) return
    resourceBehaviour.add(type, amount)
  }

  /**
   * Opens the imprint window.
   */
  public static openImprint(): void {
    Gui.openWindow("imprint")
  }

  /**
   * Navigates back to the main menu, with confirmation if necessary.
   */
  public static async backToMainMenu(): Promise<void> {
    const toMenuConfirmed =
      Gui.getElement("#end-screen").classList.contains("open") ||
      (await Util.confirmation({
        requestMessage: Language.get("main_menu_request_message"),
      }))
    if (toMenuConfirmed) this.enterMainMenu()
  }

  /**
   * Enters the main menu screen.
   */
  private static async enterMainMenu(): Promise<void> {
    Gui.getElement(".splash-screen")?.remove()
    Gui.openWindow("main-menu").classList.add("start")
    Gui.closeWindow("end-screen")
    Gui.soundBehaviour.stop("Game")
    Gui.soundBehaviour.playLooped("Menu")
  }

  /**
   * Toggles fullscreen mode for the game.
   */
  public static async toggleFullscreen(): Promise<void> {
    await Renderer.toggleFullscreen()
  }

  /**
   * Closes a UI container element.
   * @param {HTMLElement} target - The HTML element to close.
   */
  public static closeContainer(target: HTMLElement): void {
    const id = target.closest(".container")!.id
    Gui.closeWindow(id)
    if (id === "main-menu") this.resumeGame()
  }

  /**
   * Opens the audio settings menu.
   */
  public static openAudioSettings(): void {
    Object.entries(SoundManager.volumes).forEach(
      ([type, volume]) => (Gui.getElement<HTMLInputElement>(`input#${type}`).value = (volume * 100).toString())
    )
    Gui.openWindow("audio-settings")
  }

  /**
   * Opens the game settings menu.
   */
  public static openGameSettings(): void {
    Gui.getElement<HTMLInputElement>("input#toggle-fps").checked = Settings.fpsEnabled
    Util.getElement(`[data-lang-setting="${Settings.language}"]`).classList.add("border")
    Gui.openWindow("game-settings")
  }

  /**
   * Opens the key binding settings menu.
   */
  public static openKeyBindSettings(): void {
    KeyBindManager.renderKeybinds()
    Gui.openWindow("keyBindSettings")
  }

  /**
   * Toggles snore sounds in the game.
   */
  public static toggleSnore(): void {
    Settings.snoreDisabled = !Settings.snoreDisabled
    const isDisabled = Settings.snoreDisabled
    const snoreSound = SoundManager.getSound("player/Snore")!
    Settings.saveSettings()
    if (!snoreSound) return
    isDisabled ? snoreSound.disable() : snoreSound.enable()
  }

  /**
   * Toggles FPS counter visibility.
   */
  public static toggleFps(): void {
    Settings.fpsEnabled = !Settings.fpsEnabled
    Settings.saveSettings()
    Gui.getElement("#fps-counter").classList.toggle("d-none", !Settings.fpsEnabled)
  }

  /**
   * Changes the game language.
   * @param {HTMLElement} target - The HTML element that represents the selected language.
   */
  public static changeLanguage(target: HTMLElement): void {
    const lang = target.dataset.langSetting as lang
    Language.change(lang)
    target
      .parentElement!.getAllElements("button")
      .forEach((button) => button.classList.toggle("border", button === target))
  }

  /**
   * Toggles between pause and resume states of the game.
   */
  public static togglePause(): void {
    const mainMenuIsOpen = Gui.getElement("#main-menu").classList.contains("open")
    mainMenuIsOpen ? this.resumeGame() : this.pauseGame()
  }

  /**
   * Pauses the game and opens the main menu.
   */
  public static pauseGame(): void {
    Gui.openWindow("main-menu")
    Main.pause()
  }

  /**
   * Resumes the game and closes the main menu.
   */
  public static resumeGame(): void {
    Gui.closeWindow("main-menu")
    Main.resume()
  }

  /**
   * Starts a new game, setting up necessary parameters and UI states.
   */
  public static newGame(): void {
    Gui.getElement("#main-menu").classList.remove("start")
    Main.setupNewGame()
    Gui.closeWindow("main-menu")
    Gui.closeWindow("end-screen")
    this.isPlayerInputBlocked = false
    this.isBlocked = false
  }

  /**
   * Restarts the game after user confirmation.
   */
  public static async restartGame(): Promise<void> {
    const restartConfirmed = await Util.confirmation({
      requestMessage: Language.get("restart_game_request_message"),
      affirmMessage: Language.get("restart_game_affirm_message"),
    })
    if (restartConfirmed) this.newGame()
  }

  /**
   * Adds functionality for volume sliders in the settings UI.
   */
  private static addVolumeSliderFunctionality(): void {
    Util.getAllElements<HTMLInputElement>("input[type='range']").forEach((slider) => {
      slider.addEventListener("input", (e) => {
        const type = slider.id as keyof audioTypes
        SoundManager.setVolumeType(Number(slider.value) / 100, type)
      })
      slider.addEventListener("change", () => Settings.saveSettings())
    })
  }

  /**
   * Adds functionality for handling the splash screen.
   */
  private static addSplashScreenFunctionality(): void {
    const ac = new AbortController()
    const splashScreenFunc = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent
      e.preventDefault()
      const falseKeys = ["ShiftLeft", "ShiftRight", "AltLeft", "AltRight", "ControlLeft", "ControlRight"]
      if (falseKeys.includes(keyboardEvent.code)) return
      this.enterMainMenu()
      ac.abort()
    }
    const eventTypes: (keyof WindowEventMap)[] = ["click", "touchend", "keyup"]
    eventTypes.forEach((type) => window.addEventListener(type, splashScreenFunc, { signal: ac.signal }))
  }

  /**
   * Adds functionality for screen orientation changes (e.g., pausing the game on orientation changes).
   */
  private static addScreenOrientationFunctionality(): void {
    screen.orientation.addEventListener("change", () => {
      if (screen.orientation.type === "landscape-primary" || screen.orientation.type === "landscape-secondary")
        return
      this.pauseGame()
    })
  }
}
