import Gui from "./gui.module.js"
import Resource from "./resource.module.js"

/**
 * Represents the health resource in the game.
 * This class is responsible for managing the health of the player and updating the UI accordingly.
 */
export class HealthResource extends Resource {
  /**
   * Flag to indicate if the resource should be partially used or not.
   * Defaults to true.
   */
  protected override partialUse: boolean = true

  /**
   * Uses a certain amount of health (damage).
   * @param {number} dmg - The amount of damage to apply to the health.
   * @returns {boolean} `true` if the health resource was successfully used, otherwise `false`.
   */
  public override use(dmg: number): boolean {
    const hasHealth = super.use(dmg)
    if (!hasHealth) return false
    return true
  }

  /**
   * Adds a certain amount of health to the resource.
   * Updates the health status bar after the addition.
   * @param {number} amount - The amount of health to add.
   * @returns {void}
   */
  public override add(amount: number): void {
    super.add(amount)
    Gui.updateStatusBar("hp", this.currentAmount, this.maxAmount)
  }
}
