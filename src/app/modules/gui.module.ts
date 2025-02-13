import { statusBars } from "../.types/types.js"
import SoundBehaviour from "../behaviours/sound.behaviour.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import SoundManager from "../managers/sound.manager.js"
import Util from "../util/general.util.js"
import Settings from "./settings.module.js"

/**
 * Manages the graphical user interface (GUI) of the game.
 * This class handles the setup of status bars, buttons, sounds, and other UI elements.
 */
@Util.Assets({
  img: [
    "7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png",
    "7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png",
    "7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png",
    "7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png",
    "7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png",
    "7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png",
    "7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
    "7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
    "7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
    "7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
    "7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
    "7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
    "7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png",
    "7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png",
    "7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png",
    "7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png",
    "7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png",
    "7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png",
  ],
  audio: [
    "gui/ButtonDown.mp3",
    "gui/ButtonUp.mp3",
    "gui/Countdown.mp3",
    "gui/Countdown_go.mp3",
    "gui/Win.mp3",
    "gui/Loose.mp3",
    "gui/Menu.mp3",
    "gui/Game.mp3",
  ],
})
export default abstract class Gui {
  private static elementCache: Map<string, HTMLElement> = new Map()
  public static soundBehaviour: SoundBehaviour
  private static buttons: HTMLElement[] = []
  private static statusBars: statusBars

  /**
   * Initializes the GUI by setting up the elements, sounds, and settings.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  public static async initialize(): Promise<void> {
    this.cacheElements()
    this.soundBehaviour = BehaviourFactory.create("sound", {
      soundType: "gui",
      assets: [
        "menu/ButtonDown.mp3/false",
        "menu/ButtonUp.mp3/false",
        "sfx/Countdown.mp3",
        "sfx/Countdown_go.mp3",
        "sfx/Win.mp3",
        "sfx/Loose.mp3",
        "music/Menu.mp3/false",
        "music/Game.mp3/false",
      ],
    })
    this.statusBars = {
      hp: this.getElement("#hp-bar"),
      coin: this.getElement("#coin-bar"),
      bottle: this.getElement("#bottle-bar"),
      endbossHp: this.getElement("#endboss-hp-bar"),
    }
    this.getButtons()
    this.attachSounds()
    this.loadSettings()
  }

  /**
   * Caches all required HTML elements for quick access.
   * @returns {void}
   */
  private static cacheElements(): void {
    const elementSelectors = [
      "#gui",
      "#settings",
      "#game-settings",
      "#audio-settings",
      "#keyBindSettings",
      "#keyBindModal",
      "#end-screen",
      "#imprint",
      ".splash-screen",
      "input#master",
      "input#sfx",
      "input#music",
      "input#menu",
      "input#snore",
      "input#toggle-fps",
      "#fps-counter",
      "#main-menu",
      "#hp-bar",
      "#coin-bar",
      "#bottle-bar",
      "#endboss-hp-bar",
      "#hp-buy",
      "#bottle-buy",
      "[data-click='PAUSE']",
      "[data-click='TOGGLE_FULLSCREEN']",
      "[data-click='MOVE_LEFT']",
      "[data-click='MOVE_RIGHT']",
      "[data-click='JUMP']",
      "[data-click='THROW']",
    ]
    elementSelectors.forEach((sel) => this.elementCache.set(sel, Util.getElement(sel)))
  }

  /**
   * Retrieves a cached HTML element by its selector.
   * @param {string} sel - The selector of the HTML element.
   * @returns {T} The corresponding HTML element.
   */
  public static getElement<T extends HTMLElement>(sel: string): T {
    return this.elementCache.get(sel) as T
  }

  /**
   * Opens a window by adding the "open" class.
   * @param {string} id - The ID of the window to open.
   * @returns {HTMLElement} The opened window element.
   */
  public static openWindow(id: string): HTMLElement {
    const window = this.getElement(`#${id}`)
    window.classList.add("open")
    return window
  }

  /**
   * Closes a window by removing the "open" class.
   * Optionally, closes all child windows as well.
   * @param {string} id - The ID of the window to close.
   * @param {boolean} closeChildren - Whether to also close child windows.
   * @returns {HTMLElement} The closed window element.
   */
  public static closeWindow(id: string, closeChildren = true): HTMLElement {
    const window = this.getElement(`#${id}`)
    window.classList.remove("open")
    if (closeChildren) window.getAllElements(".open").forEach((el) => el.classList.remove("open"))
    return window
  }

  /**
   * Resets the GUI, setting up status bars and playing the appropriate music.
   * @returns {Promise<void>} A promise that resolves when the reset is complete.
   */
  public static async reset(): Promise<void> {
    this.setUpStatusBars()
    await this.soundBehaviour.fadeOut("Menu", 1000)
    this.soundBehaviour.playLooped("Game")
  }

  /**
   * Sets up the status bars with their initial values.
   * @returns {void}
   */
  private static setUpStatusBars(): void {
    Object.keys(this.statusBars).forEach((type) => {
      const maxAmount = Settings.resources[type as keyof statusBars]
      this.updateStatusBar(type as keyof statusBars, type === "coin" ? 0 : maxAmount, maxAmount)
    })
  }

  /**
   * Updates the value of a specific status bar.
   * @param {keyof statusBars} type - The type of status bar to update (e.g., "coin", "hp").
   * @param {number} currentAmount - The current amount for the status bar.
   * @param {number} maxAmount - The maximum amount for the status bar.
   * @param {boolean} showError - Whether to show an error animation.
   * @returns {void}
   */
  public static updateStatusBar(
    type: keyof statusBars,
    currentAmount: number,
    maxAmount: number,
    showError = false
  ): void {
    const roundedPercent = Util.roundTo(currentAmount / maxAmount, 2)
    this.statusBars[type].style.setProperty("--value", roundedPercent.toString())
    this.statusBars[type].getElement(".current-amount").innerHTML = currentAmount.toString()
    this.statusBars[type].getElement(".max-amount").innerHTML = maxAmount.toString()
    if (showError === true) return this.statusBarError(type)
  }

  /**
   * Collects all buttons and interactive elements.
   * @returns {void}
   */
  private static getButtons(): void {
    this.buttons = Util.getAllElements("#game button, input[type='checkbox']")
    this.buttons.forEach((button) => button.addEventListener("contextmenu", (event) => event.preventDefault()))
  }

  /**
   * Attaches sound effects to buttons and inputs.
   * @returns {void}
   */
  private static attachSounds(): void {
    const buttonDownSound = this.soundBehaviour.getSound("ButtonDown")
    const buttonUpSound = this.soundBehaviour.getSound("ButtonUp")
    this.buttons
      .filter((btn) => !btn.classList.contains("no-sound"))
      .forEach((btn) => {
        btn.addEventListener("pointerdown", (e) => {
          if (!Util.pointerEventIsLeftClick(e)) return
          buttonDownSound?.playOnce()
          btn.addEventListener(
            "pointerup",
            (e) => {
              if (!Util.pointerEventIsLeftClick(e)) return
              buttonUpSound?.playOnce()
            },
            { once: true }
          )
        })
      })
  }

  /**
   * Loads the user's settings into the GUI elements.
   * @returns {void}
   */
  private static loadSettings(): void {
    this.getElement<HTMLInputElement>("input#snore").checked = !Settings.snoreDisabled
    this.getElement<HTMLInputElement>("input#toggle-fps").checked = Settings.fpsEnabled
    this.getElement("#fps-counter").classList.toggle("d-none", !Settings.fpsEnabled)
    this.getElement("#hp-buy").innerText = Settings.itemCosts.healthPoints.toString()
    this.getElement("#bottle-buy").innerText = Settings.itemCosts.bottles.toString()
  }

  /**
   * Updates the countdown timer displayed in the GUI.
   * @param {number} secondsLeft - The number of seconds left in the countdown.
   * @returns {void}
   */
  public static updateCountDown(secondsLeft: number): void {
    const countDownElement = Util.getElement("#countdown span")
    const text = secondsLeft > 0 ? secondsLeft.toString() : "GO!"
    Util.addAnimationClass(countDownElement, "active")
    countDownElement.innerText = text
    const countDownSound = secondsLeft > 0 ? "Countdown" : "Countdown_go"
    SoundManager.getSound(countDownSound)?.playOnce()
  }

  /**
   * Triggers an error animation on a specific status bar.
   * @param {keyof statusBars} type - The type of status bar to animate.
   * @returns {void}
   */
  public static statusBarError(type: keyof statusBars): void {
    Util.addAnimationClass(this.statusBars[type], "error")
  }
}
