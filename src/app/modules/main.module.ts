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
import Util from "../util/general.util.js"
import SpawnManager from "../managers/spawn.manager.js"
import TriggerManager from "../managers/trigger.manager.js"
import AssetManager from "../managers/asset.manager.js"
import Input from "./input.module.js"
import Camera from "./camera.module.js"
import Settings from "./settings.module.js"

export default abstract class Main {
	public static canvas: HTMLCanvasElement
	public static ctx: CanvasRenderingContext2D
	private static gameElement: HTMLElement
	public static get GameElement(): HTMLElement {
		return this.gameElement
	}
	public static isPaused = true
	public static readonly frameRate = 60 / 1000
	public static readonly maxPosX = 10 * 1000

	public static hasStarted = false
	private static countdownTimer?: Timer
	public static totalTime = 0

	// renderer: Renderer
	// soundManager!: SoundManager
	// timerManager!: TimerManager
	// triggerManager!: TriggerManager
	// gui!: Gui

	public static player: Player
	public static background: Background
	public static clouds: Clouds
	public static enemies: Enemy[]
	public static endboss: Endboss

	public static allObjects: Map<number, GameObject> = new Map()

	public static async initialize(canvas: HTMLCanvasElement, gameElement: HTMLElement): Promise<void> {
		this.canvas = canvas
		this.ctx = this.canvas.getContext("2d")!
		this.gameElement = gameElement
		await AssetManager.loadAssets()
		Settings.initialize()
		Input.initialize()
		SoundManager.initialize()
		TimerManager.initialize()
		Gui.initialize()
		TimerManager.initialize()
		Renderer.initialize()
	}

	private static setUpObjects(): void {
		this.allObjects = new Map()
		this.background = GameObjectFactory.create("background")
		this.clouds = GameObjectFactory.create("clouds")
		this.player = GameObjectFactory.create("player")
		this.enemies = [
			// GameObjectFactory.create("enemy"),
			// GameObjectFactory.create("enemy"),
			// GameObjectFactory.create("enemy")
		]
		SpawnManager.initialize()
	}

	public static addObject(id: number, obj: GameObject): void {
		this.allObjects.set(id, obj)
	}

	public static removeObject(id: number): boolean {
		return this.allObjects.delete(id)
	}

	public static setupNewGame(): void {
		this.totalTime = 0
		Input.toggleInput(false)
		this.hasStarted = false
		this.countdownTimer?.kill()
		this.setUpObjects()
		Renderer.reset()
		Camera.initialize()
		Gui.reset()

		this.update()
		this.startCountDown()
	}

	public static async startGame(): Promise<void> {
		Input.toggleInput(true)
		this.resume()
		this.player.setState("idle")
	}

	public static togglePause() {
		// console.log("toggling pause")
		this.isPaused ? this.resume() : this.pause()
	}

	public static pause() {
		window.dispatchEvent(new CustomEvent("pausegame"))
		this.isPaused = true
	}

	public static resume() {
		this.initializeGamePauseOnVisibilityChange()
		window.dispatchEvent(new CustomEvent("resumegame"))
		this.isPaused = false
	}

	private static update() {
		Renderer.render()
		TriggerManager.check()
		requestAnimationFrame(() => this.update())
	}

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

	public static startCountDown(secondsLeft = Settings.countdownTime): void {
		Gui.updateCountDown(secondsLeft)
		if (secondsLeft === 0) {
			this.hasStarted = true
			this.startGame()
			return
		}
		this.countdownTimer = new Timer(() => this.startCountDown(secondsLeft - 1), 1000, false).resume()
	}

	public static winGame(): void {
		console.log("Game Won!")
		this.endGame("won")
	}

	public static looseGame(): void {
		console.log("Game Over!")
		this.endGame("lost")
	}

	private static endGame(state: "won" | "lost"): void {
		console.log(`${state} in ${Util.formatTime(this.totalTime)}!`)
	}

	public static spawnEndboss(): void {
		console.log("spawning endboss")
		this.endboss = GameObjectFactory.create("endboss")
		// this.endboss.spawn()
	}
}
