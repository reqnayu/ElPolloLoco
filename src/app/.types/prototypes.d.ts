declare global {
	interface HTMLElement {
		getElement<T extends HTMLElement>(selector: string): T
		getAllElements<T extends HTMLElement>(selector: string): T[]
		addAbortableEventListener<K extends keyof HTMLElementEventMap>(
			eventType: K,
			listener: (this: typeof this, ev: HTMLElementEventMap[K], abort: () => void) => void,
			options?: AddEventListenerOptions
		): void
	}
	interface Array<T extends any> {
		remove(element: T): boolean
		toFiltered(filterFunc: (el: T) => boolean): this
	}
	interface Map<K, V> {
		filter(filterFunc: ([key, value]: [K, V]) => boolean): Map<K, V>
	}
	interface Window {
		addAbortableEventListener<K extends keyof WindowEventMap>(
			eventType: K,
			listener: (this: Window, ev: WindowEventMap[K], abort: () => void) => void,
			options?: AddEventListenerOptions
		): void
		addReusableEventListener<K extends keyof WindowEventMap>(
			eventType: K,
			listener: (this: Window, ev: WindowEventMap[K], reuse: () => void) => void,
			options?: AddEventListenerOptions
		): void
		// addReusableEventListener: typeof window.addEventListener
	}
}

export {}
