import "../.types/prototypes.js"
import { assetsParams } from "../.types/types.js"
import AssetManager from "../managers/asset.manager.js"
import Language from "../modules/language.module.js"

/**
 * A utility class containing static methods for common tasks such as DOM manipulation,
 * event handling, randomization, time formatting, and more.
 */
export default abstract class Util {
  /**
   * Gets a single DOM element by the provided selector.
   *
   * @param selector The CSS selector of the element to find.
   * @param thisArg The context in which to search (default is `document`).
   * @returns The DOM element matching the selector.
   */
  public static getElement<T extends HTMLElement>(
    selector: string,
    thisArg: HTMLElement | Document = document
  ): T {
    return thisArg.querySelector(selector) as T
  }

  /**
   * Gets all DOM elements matching the provided selector.
   *
   * @param selector The CSS selector of the elements to find.
   * @param thisArg The context in which to search (default is `document`).
   * @returns An array of DOM elements matching the selector.
   */
  public static getAllElements<T extends HTMLElement>(
    selector: string,
    thisArg: HTMLElement | Document = document
  ): T[] {
    return Array.from(thisArg.querySelectorAll(selector)) as T[]
  }

  /**
   * A decorator method that is used to add asset paths to the AssetManager.
   *
   * @param img An array of image paths.
   * @param audio An array of audio paths.
   * @returns A decorator function.
   */
  public static Assets({ img, audio }: assetsParams) {
    if (img) AssetManager.imagePaths.push(...img.map((src) => `app/assets/img/${src}`))
    if (audio) AssetManager.soundPaths.push(...audio.map((src) => `app/assets/audio/${src}`))
    return function (constructor: Function) {}
  }

  /**
   * Delegates an event to the window by adding an event listener.
   *
   * @param type The type of event to listen for.
   * @param callback The callback function to invoke when the event occurs.
   * @param useCapture Whether to use capturing or bubbling phase (default is `false`).
   */
  public static delegateEvent(
    type: keyof DocumentEventMap,
    callback: (event: Event) => any,
    useCapture: boolean = false
  ) {
    window.addEventListener(type, callback, useCapture)
  }

  /**
   * Creates a throttled version of a callback function. The callback will only be invoked after a specified delay.
   *
   * @param cb The callback function to throttle.
   * @param delay The delay in milliseconds between consecutive invocations (default is 1000).
   * @returns A throttled version of the provided callback.
   */
  public static throttle(cb: (...args: any[]) => any, delay = 1000) {
    let shouldWait = false
    return (...args: any[]) => {
      if (shouldWait) return
      cb(...args)
      shouldWait = true
      setTimeout(() => (shouldWait = false), delay)
    }
  }

  /**
   * Rounds a number to a specified number of decimal places.
   *
   * @param number The number to round.
   * @param digits The number of decimal places to round to (optional).
   * @returns The rounded number.
   */
  public static roundTo(number: number, digits?: number): number {
    const magnitude = !!digits ? 10 ** digits : 1
    return Math.round(number * magnitude) / magnitude
  }

  /**
   * Clamps a number within a specified range.
   *
   * @param number The number to clamp.
   * @param min The minimum value.
   * @param max The maximum value.
   * @returns The clamped number.
   */
  public static clamp(number: number, min: number, max: number): number {
    return Math.min(Math.max(number, min), max)
  }

  /**
   * Randomizes a number or an item from an array. Can return a rounded number if specified.
   *
   * @param minOrItems Either a number (minimum value) or an array of items to choose from.
   * @param max If `minOrItems` is a number, this is the maximum value for randomization.
   * @param rounded Whether to round the result to an integer (default is `false`).
   * @returns A random number or item from the array.
   */
  public static randomize(minOrItems: number | any[], max?: number, rounded?: boolean): number | any {
    if (typeof minOrItems === "number") {
      const min = minOrItems
      const range = max! - min + 1
      const rand = Math.floor(Math.random() * range + min)
      return rounded ? this.roundTo(rand) : rand
    } else {
      const items = minOrItems
      const randomIndex = this.randomize(0, items.length - 1, true)
      return items[randomIndex] as any
    }
  }

  /**
   * Checks if a pointer event was triggered by a left-click.
   *
   * @param e The event to check.
   * @returns `true` if the event was a left-click, otherwise `false`.
   */
  public static pointerEventIsLeftClick(e: Event): boolean {
    return (e as PointerEvent).which === 1
  }

  /**
   * Shows a confirmation prompt with "affirm" and "cancel" buttons.
   *
   * @param options The options for the confirmation prompt.
   * @returns A promise that resolves to `true` if the affirm button is clicked, `false` if the cancel button is clicked.
   */
  public static async confirmation(options: confirmationOptions): Promise<boolean> {
    const template = this.confirmationTemplate(options)
    return new Promise((resolve) => {
      template.getAllElements(".cancel, .affirm").forEach((el) =>
        el.addEventListener("click", () => {
          template.remove()
          resolve(el.classList.contains("cancel") ? false : true)
        })
      )
      this.getElement("#game").append(template)
    })
  }

  /**
   * Generates a confirmation prompt template.
   *
   * @param options The options for the confirmation prompt.
   * @returns The HTML template for the confirmation prompt.
   */
  private static confirmationTemplate(options: confirmationOptions): HTMLElement {
    const HTMLTemplate = /*html*/ `
				<div class="confirmation column">
					<p class="row">${options.requestMessage}</p>
					<div class="row">
						<button class="cancel btn btn-secondary border">${options.cancelMessage || Language.get("cancel")}</button>
						<button class="affirm btn btn-primary border">${options.affirmMessage || "OK"}</button>
					</div>
				</div>
		`
    const template = document.createElement("div")
    template.innerHTML = HTMLTemplate
    template.classList.add("confirmation-container", "open")
    return template
  }

  /**
   * Pauses execution for a given number of milliseconds.
   *
   * @param timeout The number of milliseconds to wait before resolving the promise.
   * @returns A promise that resolves after the specified timeout.
   */
  public static sleep(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, timeout)
    })
  }

  /**
   * Adds an animation class to an element and removes it once the animation ends.
   *
   * @param element The DOM element to animate.
   * @param className The name of the animation class to apply.
   */
  public static addAnimationClass(element: HTMLElement, className: string): void {
    element.addEventListener("animationend", () => element.classList.remove(className), { once: true })
    element.classList.add(className)
  }

  /**
   * Logical XOR (exclusive OR) between two boolean values.
   *
   * @param bool1 The first boolean value.
   * @param bool2 The second boolean value.
   * @returns `true` if exactly one of the boolean values is `true`, otherwise `false`.
   */
  public static xOr(bool1: boolean, bool2: boolean): boolean {
    return (bool1 || bool2) && !(bool1 && bool2)
  }

  /**
   * Capitalizes the first letter of a word.
   *
   * @param word The word to capitalize.
   * @returns The word with the first letter capitalized.
   */
  public static capitalizeFirstLetter(word: string): string {
    const [firstLetter, ...rest] = word.toLowerCase()

    return `${firstLetter.toUpperCase()}${rest.reduce((a, c) => `${a}${c}`, "")}`
  }

  /**
   * Converts a total number of milliseconds into a time object with hours, minutes, seconds, and milliseconds.
   *
   * @param totalMilliseconds The total time in milliseconds.
   * @returns An object with hours, minutes, seconds, and remaining milliseconds.
   */
  public static getTime(totalMilliseconds: number): {
    hours: number
    minutes: number
    seconds: number
    milliseconds: number
  } {
    let rest = totalMilliseconds
    const oneHour = 1000 * 60 * 60
    const oneMinute = oneHour / 60
    const oneSecond = oneMinute / 60

    const hours = Math.floor(rest / oneHour)
    rest -= hours * oneHour
    const minutes = Math.floor(rest / oneMinute)
    rest -= minutes * oneMinute
    const seconds = Math.floor(rest / oneSecond)
    rest -= seconds * oneSecond
    return { hours, minutes, seconds, milliseconds: rest }
  }

  /**
   * Formats a given time in milliseconds as a string in the format `hh:mm:ss.sss`.
   *
   * @param totalMilliseconds The total time in milliseconds to format.
   * @returns A formatted time string.
   */
  public static formatTime(totalMilliseconds: number): string {
    const { hours, minutes, seconds, milliseconds } = this.getTime(totalMilliseconds)
    const [hr, min, sec] = [hours, minutes, seconds].map((n) => n.toString().padStart(2, "0"))
    return `${hr}:${min}:${sec}.${this.roundTo(milliseconds / 1000, 2)
      .toString()
      .slice(2)}`
  }

  /**
   * Returns the positive modulus of a number.
   *
   * @param n The number to apply the modulus operation to.
   * @param m The modulus value.
   * @returns The positive modulus result.
   */
  public static modPos(n: number, m: number): number {
    return ((n % m) + m) % m
  }
}

type confirmationOptions = {
  requestMessage: string
  affirmMessage?: string
  cancelMessage?: string
}
