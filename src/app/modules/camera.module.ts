import GameObject from "../gameObjects/gameObject.object.js"
import Util from "../util/general.util.js"
import Main from "./main.module.js"
import Settings from "./settings.module.js"
import Vector from "./vector.module.js"

/**
 * Manages the camera focus, zoom, and resolution for the game.
 * The Camera class calculates and updates the camera's focus and zoom level based on objects in focus.
 */
export default class Camera {
  /** The current focus of the camera. */
  public static _focus: Vector

  /** Pixels moved per frame for focus adjustment. */
  private static readonly pixelsPerFrame = 1.5

  /** The aspect ratio of the camera. */
  public static readonly aspectRatio = 16 / 9

  /** The base resolution of the camera without zoom applied. */
  public static readonly _baseResolution = new Vector(1280, 720)

  /** The current zoom level of the camera. */
  public static zoom = 1.3

  /** The maximum zoom level the camera can achieve. */
  public static readonly maxZoom = 3

  /** The minimum zoom level the camera can have. */
  public static minZoom = 1.3

  /** The objects the camera should focus on. */
  public static focusObjects: GameObject[]

  /**
   * Gets the camera's resolution considering the current zoom level.
   * @returns {Vector} - The resolution of the camera, scaled by the current zoom level.
   */
  public static get resolution(): Vector {
    return this._baseResolution.scale(this.zoom)
  }

  /**
   * Gets the current focus of the camera based on its position and resolution.
   * @returns {Vector} - The current focus of the camera.
   */
  public static get focus(): Vector {
    const middleVec = this.resolution.scale(0.5)
    const focusVector = (this._focus ?? Vector.zero).plus(middleVec.scale(-1))
    return new Vector(focusVector.x, 0)
  }

  /**
   * Gets the desired focus point, calculated from the average position of all focus objects.
   * The result is clamped within certain boundaries.
   * @returns {Vector} - The desired focus position for the camera.
   */
  public static get desiredFocus(): Vector {
    const objectFocus = Vector.average(this.getStartAndEndFocusObjects().map(({ focusVector }) => focusVector))
    const minFocusX = this.resolution.scale(0.5).x
    objectFocus.x = Util.clamp(objectFocus.x, minFocusX, Settings.maxPosX - minFocusX)
    return objectFocus
  }

  /**
   * Gets the desired zoom level based on the objects in focus and their distance.
   * @returns {number} - The desired zoom level.
   */
  private static get desiredZoom(): number {
    if (this.focusObjects.length <= 1) return this.minZoom
    const [obj1, obj2] = this.getStartAndEndFocusObjects()
    const distance = obj2.position.x + obj2.Dimensions.x - obj1.position.x
    const paddingFactor = 1.2
    const desiredZoom = (distance / this._baseResolution.x) * paddingFactor
    return Util.clamp(desiredZoom, this.minZoom, this.maxZoom)
  }

  /**
   * Initializes the camera with default settings.
   * Sets the initial zoom, minimum zoom, and focus objects.
   * @returns {void}
   */
  public static initialize(): void {
    this.minZoom = 1.3
    this.zoom = this.minZoom
    this.focusObjects = [Main.player]
    this._focus = new Vector(this.resolution.x / 2, 0)
  }

  /**
   * Updates the camera's focus and zoom levels based on the delta time.
   * @param {number} deltaTime - The time elapsed since the last update, in seconds.
   * @returns {void}
   */
  public static update(deltaTime: number): void {
    this.updateFocus(deltaTime)
    this.updateZoom(deltaTime)
  }

  /**
   * Updates the zoom level of the camera towards the desired zoom.
   * @param {number} deltaTime - The time elapsed since the last update, in seconds.
   * @returns {void}
   */
  private static updateZoom(deltaTime: number): void {
    if (this.zoom === this.desiredZoom) return
    const zoomFactor = 1 / 500
    const stepSize = (this.desiredZoom - this.zoom) * deltaTime * zoomFactor
    this.zoom += stepSize
  }

  /**
   * Updates the focus of the camera towards the desired focus position.
   * @param {number} deltaTime - The time elapsed since the last update, in seconds.
   * @returns {void}
   */
  private static updateFocus(deltaTime: number) {
    if (this.focusObjects.length === 0) return
    const distance = this._focus.plus(this.desiredFocus.scale(-1))
    if (Math.abs(distance.x) <= 1) return (this._focus.x = this.desiredFocus.x)
    const step = distance.normalize().scale(-this.pixelsPerFrame * deltaTime)
    this._focus.x += step.x
  }

  /**
   * Retrieves the first and last focus objects sorted by their position.
   * @returns {[GameObject, GameObject]} - The first and last objects to be focused on.
   */
  private static getStartAndEndFocusObjects(): [GameObject, GameObject] {
    const objects = this.focusObjects.sort((a, b) => a.position.x - b.position.x)
    return [objects[0], objects.at(-1)!]
  }
}
