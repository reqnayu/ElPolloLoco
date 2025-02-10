import Gui from "./gui.module.js"
import Resource from "./resource.module.js"

/**
 * Represents a resource for bottles in the game.
 * This class extends the base `Resource` class and overrides methods
 * to manage bottle usage, addition, and empty resource handling.
 */
export class BottleResource extends Resource {
  /**
   * Uses one unit of the bottle resource.
   * If the resource is available, it reduces the amount and updates the status bar.
   * @returns {boolean} - Returns `true` if the resource is used successfully, otherwise `false`.
   */
  public override use(): boolean {
    const isSuccessful = super.use(1)
    if (!isSuccessful) return false
    Gui.updateStatusBar("bottle", this.currentAmount, this.maxAmount)
    return true
  }

  /**
   * Adds one unit of the bottle resource.
   * Updates the status bar after the addition.
   * @returns {void}
   */
  public override add(): void {
    super.add(1)
    Gui.updateStatusBar("bottle", this.currentAmount, this.maxAmount)
  }

  /**
   * Handles the case when the bottle resource is empty.
   * Displays an error message on the status bar.
   * @returns {void}
   */
  public override emptyUse(): void {
    Gui.statusBarError("bottle")
  }
}
