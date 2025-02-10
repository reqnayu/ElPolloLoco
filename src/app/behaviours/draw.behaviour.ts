import { Drawable } from "../.types/interfaces.js"
import { drawParams, Frame } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Camera from "../modules/camera.module.js"
import Settings from "../modules/settings.module.js"

/**
 * Handles rendering a game object to the canvas.
 * This class manages transformations, scaling, and optional collider drawing.
 *
 * @implements {Drawable}
 */
export default class DrawBehaviour implements Drawable {
  /** The game object this draw behavior is attached to. */
  private gameObject!: GameObject

  /**
   * Creates an instance of DrawBehaviour.
   *
   * @param {drawParams} options - The parameters for configuring draw behavior.
   */
  constructor(options: drawParams) {}

  /**
   * Attaches this draw behavior to a game object.
   *
   * @param {GameObject} gameObject - The game object to attach the draw behavior to.
   * @returns {this} The current instance for method chaining.
   */
  public onAttach(gameObject: GameObject): this {
    this.gameObject = gameObject
    return this
  }

  /**
   * Draws the game object onto the provided canvas rendering context.
   * Applies transformations based on camera focus, direction, and scaling.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    const frame = this.requestFrame()
    const { image, dx: rawDx, dy: rawDy, dWidth, dHeight, direction } = frame

    ctx.resetTransform()
    const scale = ctx.canvas.width / Camera.resolution.x
    ctx.scale(direction * scale, scale)

    const { x, y } = Camera.focus
    ctx.translate(-x * direction, y * scale)

    if (direction === 1) {
      ctx.translate(rawDx, ctx.canvas.height / scale)
    } else {
      ctx.translate(-(rawDx + dWidth), ctx.canvas.height / scale)
    }

    const dy = -rawDy - dHeight
    ctx.drawImage(image, 0, dy, dWidth, dHeight)

    if (Settings.drawColliders && this.gameObject.collisionBehaviour) {
      this.drawCollider(ctx, 0, dy, dWidth, dHeight)
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  /**
   * Draws the collider of the game object if collision debugging is enabled.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {number} dx - The x-offset for drawing the collider.
   * @param {number} dy - The y-offset for drawing the collider.
   * @param {number} dWidth - The width of the game object.
   * @param {number} dHeight - The height of the game object.
   */
  public drawCollider(
    ctx: CanvasRenderingContext2D,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number
  ): void {
    const [top, right, bottom, left] = this.gameObject.collisionBehaviour?.offsets || [0, 0, 0, 0]
    ctx.strokeRect(dx + left, dy + top, dWidth - left - right, dHeight - bottom - top)
  }

  /**
   * Computes the frame data for rendering, including position, dimensions, and direction.
   *
   * @private
   * @returns {Frame} The frame data for rendering.
   */
  private requestFrame(): Frame {
    return {
      image: this.gameObject.image!,
      dx: Math.round(this.gameObject.position.x),
      dy: Math.round(this.gameObject.position.y),
      dWidth: Math.round(this.gameObject.Dimensions.x),
      dHeight: Math.round(this.gameObject.Dimensions.y),
      direction: this.gameObject.direction,
    }
  }
}
