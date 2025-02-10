import { Updateable } from "../.types/interfaces.js"
import { gravityParams } from "../.types/types.js"
import Vector from "../modules/vector.module.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Settings from "../modules/settings.module.js"

/**
 * Handles gravity physics for a game object, allowing it to fall and land on the floor.
 *
 * @implements {Updateable}
 */
export default class GravityBehaviour implements Updateable {
  /** The game object this gravity behavior is attached to. */
  gameObject!: GameObject

  /** The gravity force applied to the object, acting downward. */
  private gravity = new Vector(0, -0.002)

  /** Whether the object can fall through the floor instead of landing. */
  canFallThroughFloor = false

  /** Callback function triggered when the object lands. */
  private landCallback?: () => void

  /**
   * Creates an instance of GravityBehaviour.
   *
   * @param {gravityParams} [params] - Optional parameters for configuring gravity behavior.
   */
  constructor({ landCallback }: gravityParams = {}) {
    this.landCallback = landCallback
  }

  /**
   * Attaches this gravity behavior to a game object.
   *
   * @param {GameObject} gameObject - The game object to attach the gravity behavior to.
   * @returns {this} The current instance for method chaining.
   */
  public onAttach(gameObject: GameObject): this {
    this.gameObject = gameObject
    return this
  }

  /**
   * Updates the game object's position by applying gravity.
   * Checks if the object should land or continue falling.
   *
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public update(deltaTime: number): void {
    if (this.shouldLand()) return this.land()
    if (!this.canFall()) return
    this.fall(deltaTime)
  }

  /**
   * Determines whether the game object is above the floor and can fall.
   *
   * @returns {boolean} `true` if the object is above the floor, otherwise `false`.
   */
  public canFall(): boolean {
    return this.gameObject.position.y > Settings.floorHeight
  }

  /**
   * Checks if the game object should land on the floor.
   *
   * @private
   * @returns {boolean} `true` if the object should land, otherwise `false`.
   */
  private shouldLand(): boolean {
    if (this.canFallThroughFloor === true) return false
    const vy = this.gameObject.movementBehaviour!.velocity.y
    const posY = this.gameObject.position.y
    return vy < 0 && posY <= Settings.floorHeight
  }

  /**
   * Applies gravity to the game object's velocity, making it fall.
   *
   * @private
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  private fall(deltaTime: number): void {
    this.gameObject.movementBehaviour!.velocity.y += this.gravity.scale(deltaTime).y
  }

  /**
   * Stops the falling motion and places the object on the floor.
   * Resets vertical velocity and triggers the land callback if provided.
   *
   * @private
   */
  private land(): void {
    if (this.gameObject.state?.type === "jump") this.gameObject.setState("idle")
    this.gameObject.movementBehaviour!.velocity.y = 0
    this.gameObject.position.y = Settings.floorHeight
    this.landCallback?.()
  }
}
