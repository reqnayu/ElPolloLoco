import BehaviourFactory from "../factories/behaviour.factory.js"
import Camera from "../modules/camera.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"

/**
 * Represents the clouds in the background of the game.
 * The clouds are drawn and move based on the camera’s focus and resolution.
 */
@Util.Assets({
  img: ["5_background/layers/4_clouds/full.png"],
})
export default class Clouds extends GameObject {
  /**
   * The direction the clouds are moving. Positive value means right, negative means left.
   *
   * @default -1
   */
  direction: 1 | -1 = -1

  /**
   * The speed at which the clouds move (simulating wind).
   *
   * @private
   */
  private windSpeed = 0.1

  /**
   * Creates an instance of the `Clouds` class.
   * The clouds are initialized with a default image source.
   */
  constructor() {
    super("clouds")
    this.initialize("5_background/layers/4_clouds/full.png")
  }

  /**
   * Initializes the cloud object, sets its behaviors, and dimensions.
   *
   * @override
   * @param {string} imgSrc - The image source for the clouds.
   */
  protected override initialize(imgSrc: string): void {
    this.setBehaviours()
    this.dimensions.set(Camera.resolution) // Clouds cover the whole resolution of the screen.
    return super.initialize(imgSrc)
  }

  /**
   * Sets the behaviors for the clouds, including their drawing and movement behaviors.
   *
   * @override
   */
  protected override setBehaviours(): void {
    this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
    this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: this.windSpeed }).onAttach(this)
    this.movementBehaviour.input.isMovingLeft = true // Clouds move left by default.
  }

  /**
   * Updates the position of the clouds based on the camera's focus and the current resolution.
   * This ensures that the clouds scroll smoothly across the screen.
   *
   * @override
   * @param {number} deltaTime - The delta time for the update cycle.
   */
  public override update(deltaTime: number): void {
    super.update(deltaTime)

    const resolutionX = Camera.resolution.x
    const cameraOffset = Camera.focus.x - this.position.x

    // If the clouds move out of the camera view, loop them to the other side
    if (cameraOffset > resolutionX) {
      this.position.x += resolutionX * 2
    } else if (cameraOffset < -resolutionX) {
      this.position.x -= resolutionX * 2
    }
  }
}
