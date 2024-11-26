import { lang } from "../.types/types.js"
import Util from "../util/general.util.js"
import Settings from "./settings.module.js"

export abstract class Language {
	private static isInitialized = false
	private static readonly jsonPath = "app/assets/languages.json"
	private static data: Record<string, Record<string, string>> = {}

	public static async initialize(): Promise<void> {
		if (this.isInitialized) return
		this.data = await (await fetch(this.jsonPath)).json()
		this.isInitialized = true
	}

	public static render(): void
	public static render(container: HTMLElement): void
	public static render(container?: HTMLElement): void {
		this.checkInitialization()
		const langElements = container?.getAllElements("[data-lang]") ?? Util.getAllElements("[data-lang]")
		langElements.forEach((el) => {
			const key = el.dataset.lang!
			const value = this.get(key)
			el.innerText = value
		})
	}

	public static change(lang: lang): void {
		Settings.language = lang
		Settings.saveSettings()
		this.render()
	}

	public static get(key: string): string
	public static get(key: string, ...params: string[]): string
	public static get(key: string, ...params: string[]): string {
		this.checkInitialization()
		const value = this.data[Settings.language][key]
		if (!value) throw Error(`${key} not found!`)
		if (params.length && params.length !== value.match(/%\w+%/g)?.length)
			throw Error(`number of params not matching!`)
		let paramIndex = 0
		return value.replace(/%(\w+)%/g, (match, replacable) => {
			return params[paramIndex++]
		})
	}

	private static checkInitialization(): void {
		if (!this.isInitialized) throw Error("Language not initialized!")
	}
}
