import "../.types/prototypes.js"

export function getElement<T extends HTMLElement>(selector: string, thisArg: HTMLElement | Document = document): T {
	return thisArg.querySelector(selector) as T
}

export function getAllElements<T extends HTMLElement>(
	selector: string,
	thisArg: HTMLElement | Document = document
): T[] {
	return Array.from(thisArg.querySelectorAll(selector)) as T[]
}

export function delegateEvent(
	type: keyof DocumentEventMap,
	callback: (event: Event) => any,
	container: Element = document.documentElement
) {
	container.addEventListener(type, callback)
}

export function throttle(cb: (...args: any[]) => any, delay = 1000) {
	let shouldWait = false
	return (...args: any[]) => {
		if (shouldWait) return
		cb(...args)
		shouldWait = true
		setTimeout(() => (shouldWait = false), delay)
	}
}

export function roundTo(number: number, digits?: number): number {
	const magnitude = !!digits ? 10 ** digits : 1
	return Math.round(number * magnitude) / magnitude
}

export function clamp(number: number, min: number, max: number): number {
	return Math.min(Math.max(number, min), max)
}

export function randomize(min: number, max: number): number {
	const range = max - min
	return Math.random() * range + min
}

export function pointerEventIsLeftClick(e: Event): boolean {
	return (e as PointerEvent).which === 1
}

type confirmationOptions = {
	requestMessage: string
	affirmMessage?: string
	cancelMessage?: string
	// successCallback: () => any
	// failCallback?: () => any
}

export async function confirmation(options: confirmationOptions): Promise<boolean> {
	const template = confirmationTemplate(options)
	return new Promise((resolve) => {
		template.getElement(".cancel").addEventListener("click", () => {
			template.remove()
			resolve(false)
		})
		template.getElement(".affirm").addEventListener("click", () => {
			template.remove()
			resolve(true)
		})
		getElement("body").append(template)
	})
}

function confirmationTemplate(options: confirmationOptions): HTMLElement {
	const HTMLTemplate = /*html*/ `
			<div class="confirmation column">
				<p>${options.requestMessage}</p>
				<div class="row">
					<button class="cancel btn btn-secondary">${options.cancelMessage || "Cancel"}</button>
					<button class="affirm btn btn-primary">${options.affirmMessage || "OK"}</button>
				</div>
			</div>
	`
	const template = document.createElement("div")
	template.innerHTML = HTMLTemplate
	template.classList.add("confirmation-container", "open")
	return template
}

export function sleep(timeout: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, timeout)
	})
}

/**
 * adds a class to an element and removes it when its applied animation has finished
 */
export function addAnimationClass(element: HTMLElement, className: string): void {
	element.addEventListener("animationend", () => element.classList.remove(className), { once: true })
	element.classList.add(className)
}

export function xOr(bool1: boolean, bool2: boolean): boolean {
	return (bool1 || bool2) && !(bool1 && bool2)
}

export function capitalizeFirstLetter(word: string): string {
	const [firstLetter, ...rest] = word.toLowerCase()

	return `${firstLetter.toUpperCase()}${rest.reduce((a, c) => `${a}${c}`, "")}`
}

export function getTime(totalMilliseconds: number): {
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

export function formatTime(totalMilliseconds: number): string {
	const { hours, minutes, seconds, milliseconds } = getTime(totalMilliseconds)
	const [hr, min, sec] = [hours, minutes, seconds].map((n) => n.toString().padStart(2, "0"))
	return `${hr}:${min}:${sec}.${roundTo(milliseconds / 1000, 2)
		.toString()
		.slice(2)}`
}
