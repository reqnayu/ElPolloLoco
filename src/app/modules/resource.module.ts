import { resourceParams } from "../.types/types.js"

/**
 * The Resource class represents a resource (e.g., health, mana) that can be used, added, or partially used.
 * It maintains the current and maximum amount of the resource, and allows manipulation of these values.
 */
export default abstract class Resource {
  /** The current amount of the resource */
  public currentAmount: number

  /** The maximum amount of the resource */
  public maxAmount: number

  /** Flag to indicate if the resource can be partially used */
  protected partialUse = false

  /**
   * Returns the fraction of the resource that is currently available, expressed as a value between 0 and 1.
   *
   * @returns The fraction of the resource (currentAmount / maxAmount), or 0 if the current amount is 0.
   */
  public get fraction(): number {
    return this.currentAmount > 0 ? this.currentAmount / this.maxAmount : 0
  }

  /**
   * Constructs a Resource instance with a specified maximum amount and an optional initial amount.
   * If no initial amount is provided, it is set to the maximum amount.
   *
   * @param params The parameters for the resource (maxAmount and currentAmount).
   */
  constructor({ maxAmount, currentAmount = maxAmount }: resourceParams) {
    this.maxAmount = maxAmount
    this.currentAmount = currentAmount
  }

  /**
   * Uses a specified amount of the resource. If the resource is insufficient and cannot be partially used,
   * the use is denied, and an empty use action is triggered.
   *
   * @param amount The amount of the resource to use.
   * @returns True if the resource use was successful, false otherwise.
   */
  public use(amount: number): boolean {
    if (!this.partialUse && this.currentAmount < amount) {
      this.emptyUse()
      return false
    }
    this.currentAmount = Math.max(0, this.currentAmount - amount)
    return true
  }

  /**
   * Adds a specified amount to the resource, ensuring it does not exceed the maximum amount.
   *
   * @param amount The amount of the resource to add.
   */
  public add(amount: number): void {
    this.currentAmount = Math.min(this.maxAmount, this.currentAmount + amount)
  }

  /**
   * Defines behavior when the resource cannot be used because it is empty.
   * This is a placeholder method that can be overridden by subclasses.
   */
  public emptyUse(): void {}
}
