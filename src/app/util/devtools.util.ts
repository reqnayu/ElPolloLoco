import Util from "./general.util.js"

/**
 * The Display class is responsible for managing and rendering display elements on the webpage.
 * It allows the creation of named displays, updating the value of a display, and rendering the current displays.
 */
export default abstract class Display {
  /**
   * A map storing active display elements where each display is identified by a name and its current value.
   * The value is stored as a string.
   */
  private static activeDisplays: Map<string, string> = new Map()

  /**
   * The container element where the display elements will be rendered in the DOM.
   */
  private static container = Util.getElement("#display")

  /**
   * Creates a new display element with a given name and an initial value of "N/A".
   *
   * @param name The name of the display to create.
   */
  public static new(name: string): void {
    this.activeDisplays.set(name, "N/A")
  }

  /**
   * Updates the value of an existing display element.
   *
   * @param name The name of the display to update.
   * @param newValue The new value to set for the display.
   */
  public static update(name: string, newValue: number): void {
    const el = this.activeDisplays.get(name)
    this.activeDisplays.set(name, newValue.toString())
  }

  /**
   * Generates the HTML template for a display element with a given name and value.
   *
   * @param name The name of the display.
   * @param value The value of the display.
   * @returns A string containing the HTML template for the display.
   */
  private static template(name: string, value: string): string {
    return /*html*/ `
			<div class="displayElement column">
				<div class="name">${name}:</div>
				<div>${value}</div>
			</div>
		`
  }

  /**
   * Renders all active display elements into the container element.
   * Clears the container before re-rendering the displays.
   */
  public static render(): void {
    this.container.innerHTML = ""
    Array.from(this.activeDisplays).forEach(([name, value]) => {
      this.container.innerHTML += this.template(name, value)
    })
  }
}
