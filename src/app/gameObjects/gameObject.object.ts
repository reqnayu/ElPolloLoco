import { GameObjectType, State, stateMap } from "../.types/types.js"
import AnimationBehaviour from "../behaviours/animation.behaviour.js"
import CollisionBehaviour from "../behaviours/collision.behaviour.js"
import DrawBehaviour from "../behaviours/draw.behaviour.js"
import GravityBehaviour from "../behaviours/gravity.behaviour.js"
import MovementBehaviour from "../behaviours/movement.behaviour.js"
import ResourceBehaviour from "../behaviours/resources.behaviour.js"
import SoundBehaviour from "../behaviours/sound.behaviour.js"
import TriggerBehaviour from "../behaviours/trigger.behaviour.js"
import StateFactory from "../factories/State.factory.js"
import AssetManager from "../managers/asset.manager.js"
import CollisionManager from "../managers/collision.manager.js"
import Main from "../modules/main.module.js"
import Vector from "../modules/vector.module.js"

/**
 * Represents a game object with various behaviors and states.
 *
 * This is an abstract class that provides core functionalities such as rendering,
 * updating, state management, and collision handling.
 */
export default abstract class GameObject {
  /** A unique identifier for the game object. */
  public readonly id = GameObject.generateId()

  /** The dimensions of the game object. */
  protected dimensions = Vector.zero

  /** Gets the dimensions of the game object. */
  public get Dimensions(): Vector {
    return this.dimensions
  }

  /** The position of the game object in the game world. */
  position = Vector.zero

  /** The image representation of the game object. */
  image?: CanvasImageSource

  /** The direction the game object is facing (-1 for left, 1 for right). */
  public direction: -1 | 1 = 1

  /** The walking speed of the game object. */
  protected walkSpeed: number = 0

  /** The current state of the game object. */
  public state?: State

  /** The list of valid states for this game object. */
  protected states: (keyof stateMap)[] = []

  /** The default state of the game object. */
  protected defaultState!: keyof stateMap

  /** Optional behaviors attached to the game object. */
  drawBehaviour?: DrawBehaviour
  movementBehaviour?: MovementBehaviour
  gravityBehavior?: GravityBehaviour
  animationBehaviour?: AnimationBehaviour
  collisionBehaviour?: CollisionBehaviour
  soundBehaviour?: SoundBehaviour
  resourceBehaviour?: ResourceBehaviour
  triggerBehaviour?: TriggerBehaviour

  /** An optional offset for focusing on the object. */
  focusOffset?: number

  /** Gets the focus point of the object. */
  protected getFocus?(): Vector

  /** Gets the focus vector, either a custom focus point or the object's center. */
  get focusVector(): Vector {
    return this.getFocus?.() || this.getCenterPoint()
  }

  /**
   * Constructs a new game object.
   *
   * @param {GameObjectType} name - The type of the game object.
   */
  constructor(public name: GameObjectType) {}

  /** A counter used to generate unique IDs for game objects. */
  private static counter = 0

  /**
   * Generates a unique ID for a game object.
   *
   * @returns {number} A unique ID.
   */
  private static generateId(): number {
    return ++this.counter
  }

  /**
   * Initializes the game object and optionally loads an image.
   *
   * @param {string} [imgSrc] - The image source to load.
   */
  protected initialize(imgSrc?: string): void {
    if (imgSrc) this.image = AssetManager.getAsset<"img">(imgSrc)
    Main.addObject(this.id, this)
  }

  /** Sets up the behaviors of the game object. */
  protected setBehaviours(): void {}

  /**
   * Sets the state of the game object.
   *
   * @param {keyof stateMap} [stateType] - The state to transition to.
   */
  public setState(stateType: keyof stateMap = this.defaultState): void {
    if (
      !this.states.includes(stateType) ||
      (stateType !== "idle" && this.state?.type === stateType) ||
      this.state?.type === "dead"
    )
      return
    this.state?.exit(this)
    this.state = StateFactory.create(stateType)
    this.state.enter(this)
  }

  /**
   * Updates the game object, processing all attached behaviors.
   *
   * @param {number} deltaTime - The time elapsed since the last update.
   */
  public update(deltaTime: number): void {
    this.animationBehaviour?.update(deltaTime)
    this.gravityBehavior?.update(deltaTime)
    this.movementBehaviour?.update(deltaTime)
    this.collisionBehaviour?.update(deltaTime)
    this.state?.update(this, deltaTime)
  }

  /**
   * Draws the game object using the given rendering context.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    this.drawBehaviour?.draw(ctx)
  }

  /**
   * Gets the center point of the game object.
   *
   * @returns {Vector} The center position of the object.
   */
  public getCenterPoint(): Vector {
    return this.position.plus(this.dimensions.scale(0.5))
  }

  /** Deletes the game object, removing it from the game world. */
  public delete(): void {
    Main.removeObject(this.id)
    CollisionManager.removeObject(this.id)
  }

  /**
   * Callback for when the game object collides with another object.
   *
   * @param {GameObject} target - The object that was collided with.
   */
  public collisionCallback(target: GameObject): void {}

  /**
   * Retrieves one or multiple images from the asset manager.
   *
   * @param {string | string[]} src - The image source(s) to retrieve.
   * @returns {CanvasImageSource | CanvasImageSource[]} The retrieved image(s).
   */
  public static getImages(srcs: string[]): CanvasImageSource[]
  public static getImages(src: string): CanvasImageSource
  public static getImages(src: string | string[]): CanvasImageSource | CanvasImageSource[] {
    if (typeof src === "string") return AssetManager.getAsset<"img">(src)
    return src.map((src) => AssetManager.getAsset<"img">(src))
  }

  /**
   * Generates a list of asset paths for a sequential animation.
   *
   * @param {string} path - The base path of the animation assets.
   * @param {number} startNumber - The starting frame number.
   * @param {number} [endNumber=startNumber] - The ending frame number.
   * @returns {string[]} An array of asset paths.
   */
  public static getSingleAnimation(path: string, startNumber: number, endNumber: number = startNumber): string[] {
    const assetPaths: string[] = []
    const assetInitial = path
      .split("/")
      .at(-1)!
      .match(/(?<=_?)[a-z]/g)![0]
      .toUpperCase()
    for (let i = startNumber; i <= endNumber; i++) {
      const src = `${path}/${assetInitial}-${i}.png`
      assetPaths.push(src)
    }
    return assetPaths
  }
}
