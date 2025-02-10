import { trigger } from "../.types/types.js"
import { Behaviour } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import TriggerManager from "../managers/trigger.manager.js"

/**
 * Handles trigger-related behavior for a game object.
 *
 * @implements {Behaviour}
 */
export default class TriggerBehaviour implements Behaviour {
  /** The game object that this behavior is attached to. */
  gameObject!: GameObject

  /**
   * Creates an instance of TriggerBehaviour.
   *
   * @param {trigger[]} triggers - An array of triggers to register with the TriggerManager.
   */
  constructor(private triggers: trigger[]) {
    this.triggers.forEach((trigger) => TriggerManager.addTrigger(trigger))
  }

  /**
   * Attaches the behavior to a game object.
   *
   * @param {GameObject} gameObject - The game object to attach to.
   * @returns {this} The instance of TriggerBehaviour.
   */
  public onAttach(gameObject: GameObject): this {
    this.gameObject = gameObject
    return this
  }
}
