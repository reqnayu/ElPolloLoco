import "../.types/prototypes.js"
import { assetsParams } from "../.types/types.js"
import AssetManager from "../managers/asset.manager.js"
import { Language } from "../modules/language.module.js"

export default abstract class Util {
	public static getElement<T extends HTMLElement>(selector: string, thisArg: HTMLElement | Document = document): T {
		return thisArg.querySelector(selector) as T
	}
	public static getAllElements<T extends HTMLElement>(
		selector: string,
		thisArg: HTMLElement | Document = document
	): T[] {
		return Array.from(thisArg.querySelectorAll(selector)) as T[]
	}

	public static Assets({ img, audio }: assetsParams) {
		if (img) AssetManager.imagePaths.push(...img.map((src) => `app/assets/img/${src}`))
		if (audio) AssetManager.soundPahts.push(...audio.map((src) => `app/assets/audio/${src}`))
		return function (constructor: Function) {}
	}

	public static delegateEvent(
		type: keyof DocumentEventMap,
		callback: (event: Event) => any,
		useCapture: boolean = false
	) {
		window.addEventListener(type, callback, useCapture)
	}

	public static throttle(cb: (...args: any[]) => any, delay = 1000) {
		let shouldWait = false
		return (...args: any[]) => {
			if (shouldWait) return
			cb(...args)
			shouldWait = true
			setTimeout(() => (shouldWait = false), delay)
		}
	}

	public static roundTo(number: number, digits?: number): number {
		const magnitude = !!digits ? 10 ** digits : 1
		return Math.round(number * magnitude) / magnitude
	}

	public static clamp(number: number, min: number, max: number): number {
		return Math.min(Math.max(number, min), max)
	}

	public static randomize(min: number, max: number): number
	public static randomize(min: number, max: number, rounded: boolean): number
	public static randomize<T extends any>(items: T[]): T
	public static randomize<T extends any>(minOrItems: number | T[], max?: number, rounded?: boolean): number | T {
		if (typeof minOrItems === "number") {
			const min = minOrItems
			const range = max! - min + 1
			const rand = Math.floor(Math.random() * range + min)
			return rounded ? this.roundTo(rand) : rand
		} else {
			const items = minOrItems
			const randomIndex = this.randomize(0, items.length - 1, true)
			return items[randomIndex] as T
		}
	}

	public static pointerEventIsLeftClick(e: Event): boolean {
		return (e as PointerEvent).which === 1
	}

	public static async confirmation(options: confirmationOptions): Promise<boolean> {
		const template = this.confirmationTemplate(options)
		return new Promise((resolve) => {
			template.getElement(".cancel").addEventListener("click", () => {
				template.remove()
				resolve(false)
			})
			template.getElement(".affirm").addEventListener("click", () => {
				template.remove()
				resolve(true)
			})
			this.getElement("#game").append(template)
		})
	}

	private static confirmationTemplate(options: confirmationOptions): HTMLElement {
		const HTMLTemplate = /*html*/ `
				<div class="confirmation column">
					<p class="row">${options.requestMessage}</p>
					<div class="row">
						<button class="cancel btn btn-secondary">${options.cancelMessage || Language.get("cancel")}</button>
						<button class="affirm btn btn-primary">${options.affirmMessage || "OK"}</button>
					</div>
				</div>
		`
		const template = document.createElement("div")
		template.innerHTML = HTMLTemplate
		template.classList.add("confirmation-container", "open")
		return template
	}

	public static sleep(timeout: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve()
			}, timeout)
		})
	}

	/**
	 * adds a class to an element and removes it when its applied animation has finished
	 */
	public static addAnimationClass(element: HTMLElement, className: string): void {
		element.addEventListener("animationend", () => element.classList.remove(className), { once: true })
		element.classList.add(className)
	}

	public static xOr(bool1: boolean, bool2: boolean): boolean {
		return (bool1 || bool2) && !(bool1 && bool2)
	}

	public static capitalizeFirstLetter(word: string): string {
		const [firstLetter, ...rest] = word.toLowerCase()

		return `${firstLetter.toUpperCase()}${rest.reduce((a, c) => `${a}${c}`, "")}`
	}

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

	public static formatTime(totalMilliseconds: number): string {
		const { hours, minutes, seconds, milliseconds } = this.getTime(totalMilliseconds)
		const [hr, min, sec] = [hours, minutes, seconds].map((n) => n.toString().padStart(2, "0"))
		return `${hr}:${min}:${sec}.${this.roundTo(milliseconds / 1000, 2)
			.toString()
			.slice(2)}`
	}

	public static modPos(n: number, m: number): number {
		return ((n % m) + n) % m
	}
}

type confirmationOptions = {
	requestMessage: string
	affirmMessage?: string
	cancelMessage?: string
	// successCallback: () => any
	// failCallback?: () => any
}
