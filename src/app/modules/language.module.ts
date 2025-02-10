import { lang } from "../.types/types.js"
import Util from "../util/general.util.js"
import Settings from "./settings.module.js"

/**
 * The Language class handles the management of language resources, allowing for initialization,
 * rendering of translations in HTML elements, changing languages, and fetching translated strings.
 */
export default abstract class Language {
  private static isInitialized = false
  private static readonly jsonPath = "app/assets/languages.json"
  private static data: Record<string, Record<string, string>> = {}

  /**
   * Initializes the language system by loading the language data from a JSON file.
   * This should be called once before any other language-related methods are used.
   *
   * @returns A promise that resolves once the language data is loaded and initialized.
   */
  public static async initialize(): Promise<void> {
    if (this.isInitialized) return
    this.data = await (await fetch(this.jsonPath)).json()
    this.isInitialized = true
  }

  /**
   * Renders the translated content in elements that have a `data-lang` attribute.
   * This will replace the inner text of these elements with the appropriate translation
   * based on the current language.
   *
   * If a container is provided, the translations will be applied only to elements within
   * that container. Otherwise, the entire document will be searched for language keys.
   *
   * @param container An optional HTML container element to limit the scope of rendering.
   */
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

  /**
   * Changes the current language to the specified language and re-renders all elements
   * that need to be translated.
   *
   * @param lang The language to switch to (e.g., 'en', 'de').
   */
  public static change(lang: lang): void {
    Settings.language = lang
    Settings.saveSettings()
    this.render()
  }

  /**
   * Retrieves the translated string for a given key.
   *
   * @param key The translation key (e.g., "greeting").
   * @param params Optional parameters that will replace placeholders in the translation string.
   *
   * @returns The translated string with parameters substituted if necessary.
   * @throws An error if the translation key is not found or if the number of parameters does not match.
   */
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

  /**
   * Checks if the language system has been initialized, throwing an error if not.
   * This is used internally to ensure that language operations are only performed after initialization.
   */
  private static checkInitialization(): void {
    if (!this.isInitialized) throw Error("Language not initialized!")
  }
}
