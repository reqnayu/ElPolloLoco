import BehaviourFactory from "../factories/behaviour.factory.js"
import Camera from "../modules/camera.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"

/**
 * Represents a background element in the game, which can have a parallax effect.
 * It is used to display and manage layers of the background.
 */
class BackgroundElement extends GameObject {
  /**
   * The total width of the background element, adjusted based on the camera resolution and zoom.
   * @returns {number} The total width of the background element.
   */
  public get totalWidth(): number {
    return this.dimensions.x * (Camera.resolution.x / Camera.zoom)
  }

  /**
   * Constructs a new `BackgroundElement`.
   *
   * @param {number} layerNumber - The layer number that determines the parallax effect.
   */
  constructor(public layerNumber: number) {
    super("background")
  }

  /**
   * Initializes the background element, including setting its behaviors and dimensions.
   *
   * @param {string} imgSrc - The image source for the background element.
   * @returns {Promise<void>} A promise that resolves when initialization is complete.
   */
  public override async initialize(imgSrc: string): Promise<void> {
    super.initialize(imgSrc)
    this.setBehaviours()
    this.initializeDimensions()
  }

  /** Initializes the dimensions of the background element based on the camera's resolution. */
  private initializeDimensions(): void {
    this.position.x = 0
    this.dimensions.set(Camera._baseResolution.x * 2, Camera._baseResolution.y)
  }

  /**
   * Sets the behaviors for the background element, including its drawing behavior.
   */
  protected override setBehaviours(): void {
    this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
  }

  /** The parallax factor, determined by the layer number. */
  private parallaxFactor = (2 - this.layerNumber) / 3

  /**
   * Draws the background element, including repeating the image based on the camera's position
   * and parallax effect.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    const baseOffsetX = Camera._focus.x * this.parallaxFactor
    const loopOffsetX = Math.floor((Camera.focus.x - baseOffsetX) / this.dimensions.x) * this.dimensions.x

    const numRepeats = Math.ceil(Camera.resolution.x / this.dimensions.x) + 1
    for (let i = 0; i < numRepeats; i++) {
      this.position.x = baseOffsetX + loopOffsetX + (this.dimensions.x - 1) * i
      super.draw(ctx)
    }
    this.position.x = baseOffsetX
  }
}

/**
 * Represents the entire background, composed of multiple layers with parallax effects.
 */
@Util.Assets({
  img: [
    "5_background/layers/3_third_layer/full.png",
    "5_background/layers/2_second_layer/full.png",
    "5_background/layers/1_first_layer/full.png",
    "5_background/layers/sky.png",
  ],
})
export default class Background extends GameObject {
  /** A list of background elements (layers). */
  private elements: BackgroundElement[] = []

  /** Flag to track if the background has finished loading. */
  private isLoaded = false

  /** The image sources for the background elements. */
  private srcSet = [
    "5_background/layers/3_third_layer/full.png",
    "5_background/layers/2_second_layer/full.png",
    "5_background/layers/1_first_layer/full.png",
  ]

  /**
   * Constructs a new `Background`.
   */
  constructor() {
    super("background")
    this.dimensions.set(Camera.resolution.scale(Camera.maxZoom / Camera.zoom))
    this.setBehaviours()
    this.initialize()
  }

  /** Initializes the background by creating its layers and loading their images. */
  protected initialize(): void {
    this.srcSet.forEach((src, i) => {
      const elementSet = [new BackgroundElement(i)]
      this.elements.push(...elementSet)
      this.elements[i].initialize(src)
    })
    super.initialize("5_background/layers/sky.png")
    this.isLoaded = true
  }

  /**
   * Sets the behaviors for the background, including the drawing behavior.
   */
  protected setBehaviours(): void {
    this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
  }

  /**
   * Draws the entire background, including all layers.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    this.drawBehaviour?.draw(ctx)
    this.elements.forEach((el) => el.draw(ctx))
  }

  /**
   * Updates the background position based on the camera's focus.
   *
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public update(deltaTime: number): void {
    if (!this.isLoaded) return
    this.position.set(Camera.focus)
  }
}
