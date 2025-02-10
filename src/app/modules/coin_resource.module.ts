import Gui from "./gui.module.js"
import Resource from "./resource.module.js"

/**
 * Represents a resource for coins in the game.
 * Provides functionality for adding, using, and handling the coin resource.
 */
export class CoinResource extends Resource {
  /**
   * Adds a specified amount of coins to the resource.
   * Updates the coin status bar to reflect the current and maximum amount.
   * @param {number} amount - The amount of coins to add.
   * @returns {void}
   */
  public override add(amount: number): void {
    super.add(amount)
    Gui.updateStatusBar("coin", this.currentAmount, this.maxAmount)
  }

  /**
   * Uses a specified amount of coins from the resource.
   * If the use is successful, the coin status bar is updated.
   * @param {number} amount - The amount of coins to use.
   * @returns {boolean} - Returns true if the use was successful, false otherwise.
   */
  public override use(amount: number): boolean {
    if (super.use(amount) === false) return false
    Gui.updateStatusBar("coin", this.currentAmount, this.maxAmount)
    return true
  }

  /**
   * Handles the case where the coin resource is empty and a use action is attempted.
   * Displays an error message on the coin status bar.
   * @returns {void}
   */
  public override emptyUse(): void {
    Gui.statusBarError("coin")
  }
}
