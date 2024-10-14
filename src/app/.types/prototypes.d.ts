declare global {
	interface HTMLElement {
		getElement<T extends HTMLElement>(selector: string): T
		getAllElements<T extends HTMLElement>(selector: string): T[]
	}
}

export {}
