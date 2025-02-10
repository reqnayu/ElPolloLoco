import { collisionParams, GameObjectType } from "../.types/types.js"
import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import CollisionManager from "../managers/collision.manager.js"
import Timer from "../modules/timer.module.js"

/**
 * Handles collision detection and response for a game object.
 * This class manages collision targets, cooldown timers, and hitbox offsets.
 *
 * @implements {Updateable}
 */
export default class CollisionBehaviour implements Updateable {
  /** The game object this collision behavior is attached to. */
  gameObject!: GameObject

  /** The cooldown duration (in milliseconds) between collisions. */
  private _cooldown: number

  /**
   * Gets the collision cooldown duration.
   * @returns {number} The cooldown duration in milliseconds.
   */
  public get cooldown(): number {
    return this._cooldown
  }

  /** Timer to manage collision cooldown. */
  private _cooldownTimer?: Timer

  /**
   * Gets the active collision cooldown timer.
   * @returns {Timer | undefined} The cooldown timer instance or undefined if no cooldown is active.
   */
  public get cooldownTimer(): Timer | undefined {
    return this._cooldownTimer
  }

  /** The amount of damage this collision inflicts. */
  private _damage: number

  /**
   * Gets the damage value for this collision.
   * @returns {number} The damage amount.
   */
  public get damage(): number {
    return this._damage
  }

  /** The list of game object types that this object can collide with. */
  public targets: GameObjectType[]

  /** Collision hitbox offsets in the order: [top, right, bottom, left]. */
  private _offsets: [number, number, number, number]

  /**
   * Gets the collision hitbox offsets.
   * @returns {[number, number, number, number]} The offsets [top, right, bottom, left].
   */
  public get offsets(): [number, number, number, number] {
    return this._offsets
  }

  /**
   * Creates an instance of CollisionBehaviour.
   *
   * @param {collisionParams} params - The parameters for configuring collision behavior.
   */
  constructor({ targets, offsets, damage, cooldown }: collisionParams) {
    this.targets = targets || []
    this._offsets = offsets || [0, 0, 0, 0]
    this._damage = damage || 0
    this._cooldown = cooldown || 0
  }

  /**
   * Attaches this collision behavior to a game object and registers it with the collision manager.
   *
   * @param {GameObject} gameObject - The game object to attach the collision behavior to.
   * @returns {this} The current instance for method chaining.
   */
  public onAttach(gameObject: GameObject): this {
    this.gameObject = gameObject
    CollisionManager.addObject(gameObject.id, gameObject)
    return this
  }

  /**
   * Updates the collision behavior. (Currently unused, but exists for interface compatibility.)
   *
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public update(deltaTime: number): void {}

  /**
   * Triggers a collision response when this object collides with a target.
   *
   * @param {GameObject} target - The target game object that this object has collided with.
   */
  public collide(target: GameObject): void {
    this.gameObject.collisionCallback(target)
  }

  /**
   * Adds a temporary cooldown for specific collision target types.
   * Removes the specified types from collision detection temporarily and re-enables them after the cooldown period.
   *
   * @param {...GameObjectType[]} types - The game object types to temporarily ignore collisions with.
   */
  public addCollisionCooldown(...types: GameObjectType[]): void {
    this._cooldownTimer?.reset()
    types.forEach((type) => this.targets.remove(type))
    this._cooldownTimer = new Timer(() => {
      this.targets.push(...types)
      this._cooldownTimer = undefined
    }, this.cooldown).resume()
  }

  /**
   * Computes the collider hitbox based on the game object's position and offset values.
   *
   * @returns {{ x: number, y: number, width: number, height: number }}
   *          The collider's position and dimensions.
   */
  public get collider() {
    const [top, right, bottom, left] = this._offsets
    const x = this.gameObject.position.x + left
    const y = this.gameObject.position.y + bottom
    const width = this.gameObject.Dimensions.x - left - right
    const height = this.gameObject.Dimensions.y - bottom - top
    return { x, y, width, height }
  }
}
