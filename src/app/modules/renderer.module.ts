import { GameObjectType } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import CollisionManager from "../managers/collision.manager.js"
import Display from "../util/devtools.util.js"
import Util from "../util/general.util.js"
import Camera from "./camera.module.js"
import Main from "./main.module.js"
import Vector from "./vector.module.js"

/**
 * The Renderer class is responsible for rendering the game objects, managing the FPS,
 * updating the game canvas dimensions, and handling the visual aspects of the game.
 */
export default abstract class Renderer {
  /** Tracks the current frame number */
  private static currentFrame = 0

  /** Stores the time of the last frame rendered */
  private static timeOfLastFrame = 0

  /** The scaling factor for the window */
  private static windowScale = 0.8

  /** Defines the rendering order of game objects */
  private static orderOfObjects: GameObjectType[] = [
    "background",
    "clouds",
    "coin",
    "enemy",
    "endboss",
    "player",
    "bottle",
  ]

  /** The FPS (frames per second) of the game */
  private static fps = 0

  /** A list of frame times for FPS calculation */
  private static frameTimes: number[] = []

  /** The number of frames to average for FPS calculation */
  private static numFramesToAverage = 30

  /**
   * Calculates the FPS based on the time between frames.
   *
   * @param deltaTime The time between the current frame and the previous frame in milliseconds.
   */
  private static calculateFps(deltaTime: number): void {
    this.frameTimes.push(deltaTime)
    if (this.frameTimes.length > this.numFramesToAverage) {
      this.frameTimes.shift()
    }

    const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    this.fps = 1000 / averageFrameTime
  }

  /**
   * Initializes the renderer by updating the canvas dimensions.
   */
  public static initialize(): void {
    this.staticDimensionUpdate()
  }

  /**
   * Resets the renderer, clearing FPS data and resetting the time of the last frame.
   */
  public static reset(): void {
    this.fps = 0
    this.frameTimes = []
    this.timeOfLastFrame = 0
  }

  /**
   * Updates the canvas dimensions based on the available window size.
   * Adjusts for aspect ratio to maintain a 16:9 ratio.
   */
  public static updateDimensions(): void {
    const { x, y } = this.getAvailableWindowDimensions()
    const isDependantOnWidth = x / y < 16 / 9
    const desiredWidth = Math.floor(isDependantOnWidth ? x : (y * 16) / 9)
    if (desiredWidth === Main.canvas.width) return
    document.documentElement.style.setProperty("--game-width", `${desiredWidth}px`)
    Main.canvas.width = desiredWidth
    Main.canvas.height = Math.floor(isDependantOnWidth ? (x * 9) / 16 : y)
  }

  /**
   * Clears the canvas to prepare for the next frame.
   */
  private static wipe() {
    const { width, height } = Main.canvas
    Main.ctx.clearRect(0, 0, width, height)
  }

  /**
   * Renders the current frame of the game, clearing the canvas, updating FPS, and rendering all game objects.
   */
  public static render() {
    const now = Date.now()
    this.wipe()
    const deltaTime = now - this.timeOfLastFrame
    this.timeOfLastFrame = now

    this.getSortedObjects().forEach((gameObject) => this.renderObject(gameObject, deltaTime))
    if (this.shouldUpdate()) this.update(deltaTime)

    this.calculateFps(deltaTime)
    this.displayPerformanceMetrics()
    Display.render()
  }

  /**
   * Updates the game state by incrementing the total time, advancing the current frame,
   * and updating the camera and collision manager.
   *
   * @param deltaTime The time between the current frame and the previous frame in milliseconds.
   */
  private static update(deltaTime: number): void {
    Main.totalTime += deltaTime
    this.currentFrame++
    Camera.update(deltaTime)
    CollisionManager.checkAll()
  }

  /**
   * Displays performance metrics such as FPS in the UI.
   */
  private static displayPerformanceMetrics(): void {
    Util.getElement("#fps-counter").innerHTML = Util.roundTo(this.fps).toString()
  }

  /**
   * Renders a specific game object by drawing it and updating it if necessary.
   *
   * @param gameObject The game object to render.
   * @param deltaTime The time between the current frame and the previous frame in milliseconds.
   */
  private static renderObject = (gameObject: GameObject, deltaTime: number) => {
    gameObject.draw(Main.ctx)
    if (this.shouldUpdate()) gameObject.update(deltaTime)
  }

  /**
   * Toggles fullscreen mode for the game.
   *
   * @returns A promise that resolves when fullscreen mode is toggled.
   */
  public static toggleFullscreen(): Promise<void> {
    if (document.fullscreenElement) return document.exitFullscreen()
    return Main.GameElement.requestFullscreen()
  }

  /**
   * Retrieves the available window dimensions, factoring in fullscreen and scaling.
   *
   * @returns A vector representing the available window dimensions (width and height).
   */
  private static getAvailableWindowDimensions(): Vector {
    const x = document.fullscreenElement?.clientWidth || window.innerWidth * this.windowScale
    const y = document.fullscreenElement?.clientHeight || window.innerHeight * this.windowScale
    return new Vector(x, y)
  }

  /**
   * Determines whether the game should be updated (i.e., if it has started and is not paused).
   *
   * @returns True if the game should be updated, false otherwise.
   */
  private static shouldUpdate(): boolean {
    return Main.hasStarted && !Main.isPaused
  }

  /**
   * Sorts the game objects based on the predefined order of rendering.
   *
   * @returns An array of game objects, sorted by the rendering order.
   */
  private static getSortedObjects(): GameObject[] {
    return Array.from(Main.allObjects)
      .map(([id, obj]) => obj)
      .sort((a, b) => this.orderOfObjects.indexOf(a.name)! - this.orderOfObjects.indexOf(b.name)!)
  }

  /**
   * Updates the canvas dimensions continuously by requesting animation frames.
   */
  private static staticDimensionUpdate(): void {
    this.updateDimensions()
    requestAnimationFrame(() => this.staticDimensionUpdate())
  }
}
