declare global {
	interface HTMLElement {
		getElement<T extends HTMLElement>(selector: string): T
		getAllElements<T extends HTMLElement>(selector: string): T[]
	}
	interface Array<T extends any> {
		remove(element: T): boolean
	}
	interface Map<K, V> {
		filter(filterFunc: ([key, value]: [K, V]) => boolean): Map<K, V>
	}
}

export {}
