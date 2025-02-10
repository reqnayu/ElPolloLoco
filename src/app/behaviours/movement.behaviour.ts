import { movementBehaviourInputMap, movementParams } from "../.types/types.js"
import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"
import Settings from "../modules/settings.module.js"

/**
 * Handles movement logic for a game object, including walking and jumping.
 *
 * @implements {Updateable}
 */
export default class MovementBehaviour implements Updateable {
  /** The game object this movement behavior is attached to. */
  gameObject!: GameObject

  /** The maximum speed for movement in both X (walk speed) and Y (jump strength) directions. */
  private maxSpeed: Vector

  /** The current velocity of the game object. */
  public velocity = Vector.zero

  /** Whether movement should be clamped within the world boundaries. */
  private clampToWorld: boolean

  /** Input map that determines movement actions. */
  public input: movementBehaviourInputMap = {
    isMovingRight: false,
    isMovingLeft: false,
    isJumping: false,
  }

  /**
   * Creates an instance of MovementBehaviour.
   *
   * @param {movementParams} params - The parameters for movement configuration.
   * @param {number} params.walkSpeed - The maximum walking speed.
   * @param {number} [params.jumpStrength] - The maximum jump strength (optional).
   * @param {boolean} [params.clampToWorld=false] - Whether to clamp movement within the world boundaries.
   */
  constructor({ walkSpeed, jumpStrength, clampToWorld = false }: movementParams) {
    this.maxSpeed = new Vector(walkSpeed, jumpStrength || 0)
    this.clampToWorld = clampToWorld
  }

  /**
   * Attaches this movement behavior to a game object.
   *
   * @param {GameObject} gameObject - The game object to attach the movement behavior to.
   * @returns {this} The current instance for method chaining.
   */
  public onAttach(gameObject: GameObject): this {
    this.gameObject = gameObject
    return this
  }

  /**
   * Updates the game object's position based on velocity and input.
   *
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public update(deltaTime: number): void {
    this.move()
    if (deltaTime === 0) return

    const newPosition = this.gameObject.position.plus(this.velocity.scale(deltaTime))
    const x = this.clampToWorld
      ? Util.clamp(newPosition.x, 0, Settings.maxPosX - this.gameObject.Dimensions.x)
      : newPosition.x
    const y = newPosition.y

    this.gameObject.position.set(x, y)
  }

  /**
   * Initiates walking movement in the direction the game object is facing.
   *
   * @private
   */
  private startWalking(): void {
    this.velocity.x = this.gameObject.direction * this.maxSpeed.x
  }

  /**
   * Stops the walking movement by setting horizontal velocity to zero.
   *
   * @private
   */
  private stopWalking(): void {
    this.velocity.x = 0
  }

  /**
   * Makes the game object jump by applying upward velocity.
   */
  public jump(): void {
    this.velocity.y = this.maxSpeed.y
  }

  /**
   * Determines movement direction based on input and applies walking behavior.
   */
  public move(): void {
    const canMove = this.canMove()
    const isStationary = this.velocity.x === 0
    const { isMovingLeft, isMovingRight } = this.input

    if (Util.xOr(isMovingLeft, isMovingRight)) {
      if (isMovingRight) this.gameObject.direction = 1
      else if (isMovingLeft) this.gameObject.direction = -1
      this.startWalking()
    } else if (!canMove && !isStationary) {
      this.stopWalking()
    }
  }

  /**
   * Checks if the game object is currently allowed to move.
   *
   * @returns {boolean} `true` if movement input is active, otherwise `false`.
   */
  public canMove(): boolean {
    return this.input.isMovingLeft || this.input.isMovingRight
  }

  /**
   * Checks if the game object is allowed to jump.
   *
   * @returns {boolean} `true` if the jump input is active, otherwise `false`.
   */
  public canJump(): boolean {
    return this.input.isJumping || false
  }

  /**
   * Stops movement by disabling left and right movement inputs.
   */
  public stopMoving(): void {
    this.input.isMovingLeft = false
    this.input.isMovingRight = false
  }
}
