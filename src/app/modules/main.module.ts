import "../.types/prototypes.js"
import GameObjectFactory from "../factories/gameObject.factory.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Gui from "./gui.module.js"
import Renderer from "./renderer.module.js"
import SoundManager from "../managers/sound.manager.js"
import TimerManager from "../managers/timer.manager.js"
import Player from "../gameObjects/player.object.js"
import Background from "../gameObjects/background.object.js"
import Clouds from "../gameObjects/clouds.object.js"
import Enemy from "../gameObjects/enemy.object.js"
import Timer from "./timer.module.js"
import Endboss from "../gameObjects/endboss.object.js"
import SpawnManager from "../managers/spawn.manager.js"
import TriggerManager from "../managers/trigger.manager.js"
import AssetManager from "../managers/asset.manager.js"
import Input from "./input.module.js"
import Camera from "./camera.module.js"
import Settings from "./settings.module.js"
import Language from "./language.module.js"
import CollisionManager from "../managers/collision.manager.js"

/**
 * The Main class is responsible for managing the overall game logic, including initialization,
 * game state management (pause, resume), handling game objects, and rendering. It serves as the
 * central control point for the game.
 */
export default abstract class Main {
  /** The canvas element used for rendering the game */
  public static canvas: HTMLCanvasElement

  /** The 2D rendering context of the canvas */
  public static ctx: CanvasRenderingContext2D

  /** The game element (container) in the HTML DOM */
  private static gameElement: HTMLElement

  /** Getter for the game element */
  public static get GameElement(): HTMLElement {
    return this.gameElement
  }

  /** Flag to indicate if the game is paused */
  public static isPaused = true

  /** Frame rate of the game (in frames per millisecond) */
  public static readonly frameRate = 60 / 1000

  /** Flag to track if the game has started */
  public static hasStarted = false

  /** Timer for the countdown before the game starts */
  private static countdownTimer?: Timer

  /** Total elapsed time in the game */
  public static totalTime = 0

  /** Holds the ID of the current animation frame */
  private static animationFrameId: number | null = null

  /** The player object in the game */
  public static player: Player

  /** The background object in the game */
  public static background: Background

  /** The clouds object in the game */
  public static clouds: Clouds

  /** Array holding all enemy objects in the game */
  public static enemies: Enemy[]

  /** The end boss object */
  public static endboss: Endboss

  /** A map containing all game objects, indexed by their ID */
  public static allObjects: Map<number, GameObject> = new Map()

  /**
   * Initializes the game by setting up the canvas, game elements, and loading essential resources.
   *
   * @param canvas The canvas element to render the game on.
   * @param gameElement The HTML element containing the game interface.
   */
  public static async initialize(canvas: HTMLCanvasElement, gameElement: HTMLElement): Promise<void> {
    this.canvas = canvas
    this.ctx = this.canvas.getContext("2d")!
    this.gameElement = gameElement
    await Language.initialize()
    Renderer.initialize()
    Settings.initialize()
    await AssetManager.loadAssets()
    Input.initialize()
    SoundManager.initialize()
    TimerManager.initialize()
    Gui.initialize()
  }

  /**
   * Sets up the main game objects like the background, clouds, player, and spawns enemies.
   */
  private static setUpObjects(): void {
    this.allObjects = new Map()
    this.background = GameObjectFactory.create("background")
    this.clouds = GameObjectFactory.create("clouds")
    this.player = GameObjectFactory.create("player")
    SpawnManager.initialize()
  }

  /**
   * Adds a game object to the game object map.
   *
   * @param id The unique ID of the game object.
   * @param obj The game object to add.
   */
  public static addObject(id: number, obj: GameObject): void {
    this.allObjects.set(id, obj)
  }

  /**
   * Removes a game object from the game object map.
   *
   * @param id The unique ID of the game object to remove.
   *
   * @returns True if the object was successfully removed, otherwise false.
   */
  public static removeObject(id: number): boolean {
    return this.allObjects.delete(id)
  }

  /**
   * Sets up a new game by resetting the game state, objects, and UI elements.
   */
  public static setupNewGame(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.totalTime = 0
    CollisionManager.reset()
    this.setUpObjects()
    Input.toggleInput(false)
    this.hasStarted = false
    this.countdownTimer?.kill()
    Renderer.reset()
    Camera.initialize()
    Gui.reset()

    this.update()
    this.startCountDown()
  }

  /**
   * Starts the game by enabling player input and resuming the game.
   */
  public static async startGame(): Promise<void> {
    Input.toggleInput(true)
    this.resume()
    this.player.setState("idle")
  }

  /**
   * Toggles the game state between paused and resumed.
   */
  public static togglePause() {
    this.isPaused ? this.resume() : this.pause()
  }

  /**
   * Pauses the game and dispatches a "pausegame" event.
   */
  public static pause() {
    window.dispatchEvent(new CustomEvent("pausegame"))
    this.isPaused = true
  }

  /**
   * Resumes the game and dispatches a "resumegame" event.
   */
  public static resume() {
    this.initializeGamePauseOnVisibilityChange()
    window.dispatchEvent(new CustomEvent("resumegame"))
    this.isPaused = false
  }

  /**
   * Updates the game by rendering the scene and checking triggers. This function is called repeatedly
   * through the animation frame.
   */
  private static update() {
    Renderer.render()
    TriggerManager.check()
    this.animationFrameId = requestAnimationFrame(() => this.update())
  }

  /**
   * Initializes the pause behavior when the visibility of the page changes (e.g., if the user switches tabs).
   */
  private static initializeGamePauseOnVisibilityChange(): void {
    document.addEventListener(
      "visibilitychange",
      (e) => {
        if (document.visibilityState === "visible") return
        Input.pauseGame()
      },
      { once: true }
    )
  }

  /**
   * Starts the countdown before the game starts. The countdown will continue until it reaches zero,
   * at which point the game will start.
   *
   * @param secondsLeft The number of seconds remaining in the countdown (defaults to the value in settings).
   */
  public static startCountDown(secondsLeft = Settings.countdownTime): void {
    Gui.updateCountDown(secondsLeft)
    if (secondsLeft === 0) {
      this.hasStarted = true
      this.startGame()
      return
    }
    this.countdownTimer = new Timer(() => this.startCountDown(secondsLeft - 1), 1000, false).resume()
  }

  /**
   * Ends the game, showing either a win or lose screen based on the `won` parameter.
   *
   * @param won True if the player won, false if they lost.
   */
  public static endGame(won: boolean): void {
    Gui.getElement("#end-screen").getElement("[data-lang='game_won']").classList.toggle("d-none", !won)
    Gui.getElement("#end-screen").getElement("[data-lang='game_over']").classList.toggle("d-none", won)
    Gui.openWindow("end-screen")
    Gui.soundBehaviour.playOnce(won ? "Win" : "Loose")
    Input.toggleInput(false)
    Camera.minZoom = 3
  }
}
