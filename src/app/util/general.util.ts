import { AnimationSet } from "../.types/animation.type.js"

export function delegateEvent(
	type: keyof DocumentEventMap,
	callback: (event: Event) => any,
	container: Element = document.documentElement
) {
	container.addEventListener(type, (event) => {
		callback(event)
	})
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
	const _digits = digits || 1
	return Math.round(number * _digits) / _digits
}

export function clamp(number: number, min: number, max: number): number {
	return Math.min(Math.max(number, min), max)
}

export function randomize(min: number, max: number): number {
	const range = max - min
	return Math.random() * range + min
}

type confirmationOptions = {
	requestMessage: string
	affirmMessage?: string
	cancelMessage?: string
	successCallback: () => any
	failCallback?: () => any
}

export async function confirmation(options: confirmationOptions): Promise<any> {
	const template = confirmationTemplate(options)
	return new Promise((resolve) => {
		template.querySelector(".cancel")!.addEventListener("click", () => {
			resolve(cancelConfirmation(template, options.failCallback))
		})
		template.querySelector(".affirm")!.addEventListener("click", () => {
			resolve(affirmConfirmation(template, options.successCallback))
		})
		document.querySelector("#game")!.append(template)
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

function cancelConfirmation<T extends any>(template: HTMLElement, failCallback?: () => T): T {
	template.remove()
	return failCallback?.() as T
}

function affirmConfirmation<T extends any>(template: HTMLElement, successCallback: () => T): T {
	template.remove()
	return successCallback() as T
}
