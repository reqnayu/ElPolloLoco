import Util from "./general.util.js"

export function runOnce<T extends (...args: any) => any>(func: T): T {
	let hasRun = false
	return ((...args) => {
		if (hasRun) return
		func(...args)
		hasRun = true
	}) as T
}

export class Display {
	private static activeDisplays: Map<string, string> = new Map()
	private static container = Util.getElement("#display")

	static new(name: string): void {
		if (!this.container) return console.log("#display container not found!")
		this.activeDisplays.set(name, "N/A")
	}

	static update(name: string, newValue: number): void {
		const el = this.activeDisplays.get(name)
		if (!el) return console.log(`display element ${name} not found!`)
		this.activeDisplays.set(name, newValue.toString())
	}

	private static template({ name, value }: displayElement): string {
		return /*html*/ `
			<div class="displayElement column">
				<div class="name">${name}:</div>
				<div>${value}</div>
			</div>
		`
	}

	static render(): void {
		this.container.innerHTML = ""
		Array.from(this.activeDisplays).forEach(([name, value]) => {
			this.container.innerHTML += this.template({ name, value })
		})
	}
}

type displayElement = {
	name: string
	value?: string
}
