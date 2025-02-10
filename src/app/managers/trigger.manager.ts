import { trigger } from "../.types/types.js"

/**
 * TriggerManager is responsible for managing triggers in the game.
 * It checks if the conditions of triggers are met and invokes the associated callbacks.
 */
export default abstract class TriggerManager {
  /**
   * An array that stores all active triggers.
   * @type {trigger[]}
   */
  private static allTriggers: trigger[] = []

  /**
   * Checks all active triggers to see if their conditions are met.
   * If a condition is met, the associated callback is invoked and the trigger is removed.
   * @returns {void}
   */
  public static check(): void {
    this.allTriggers.forEach((trigger) => {
      // If the trigger's condition is met, call the callback and remove the trigger
      if (trigger.condition() === true) {
        trigger.callback()
        this.allTriggers.remove(trigger)
      }
    })
  }

  /**
   * Adds a new trigger to the list of active triggers.
   * @param {trigger} tr - The trigger to be added.
   * @returns {void}
   */
  public static addTrigger(tr: trigger): void {
    this.allTriggers.push(tr)
  }
}
