import "../.types/prototypes.js"
import { MESSAGER } from "../../script.js"
import { GameObjectFactory } from "../factories/gameObject.factory.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Gui } from "./gui.modules.js"
import { Renderer } from "./renderer.module.js"
import { Settings } from "./settings.module.js"
import { SoundManager } from "../managers/sound_manager.module.js"
import { TimerManager } from "../managers/timer_manager.js"
import { Player } from "../gameObjects/player.object.js"
import { Background } from "../gameObjects/background.object.js"
import { Clouds } from "../gameObjects/clouds.object.js"
import { Enemy } from "../gameObjects/enemy.object.js"
import { Vector } from "./vector.module.js"
import { Timer } from "./timer.module.js"
import "../managers/asset_manager.module.js"
import { loadAssets } from "../managers/asset_manager.module.js"
import { CollisionManager } from "../managers/collision_managermodule.js"
import { Endboss } from "../gameObjects/endboss.object.js"
import { formatTime } from "../util/general.util.js"
import { SpawnManager } from "../managers/spawn_manager.module.js"
import { TriggerManager } from "../managers/trigger_manager.module.js"

export class Main {
	ctx
	isPaused = true
	readonly frameRate = 60 / 1000
	readonly maxPosX = 10 * 1000

	hasStarted = false
	countdownTimer?: Timer
	totalTime = 0

	renderer!: Renderer
	soundManager!: SoundManager
	timerManager!: TimerManager
	collisionManager!: CollisionManager
	triggerManager!: TriggerManager
	settings!: Settings
	gui!: Gui

	player!: Player
	background!: Background
	clouds!: Clouds
	enemies!: Enemy[]
	endboss!: Endboss

	allObjects: Map<number, GameObject> = new Map()

	constructor(public canvas: HTMLCanvasElement, public gameElement: HTMLElement) {
		this.ctx = this.canvas.getContext("2d")!
		MESSAGER.elements.set("main", this)
	}

	async initialize(): Promise<void> {
		this.soundManager = new SoundManager()
		this.timerManager = new TimerManager()
		this.triggerManager = new TriggerManager()
		this.renderer = new Renderer(this.canvas)
		await loadAssets()
		this.collisionManager = new CollisionManager()
		this.settings = new Settings()
		this.gui = new Gui()
	}

	private setUpObjects(): void {
		this.background = GameObjectFactory.create("background")
		this.clouds = GameObjectFactory.create("clouds")
		this.player = GameObjectFactory.create("player")
		this.enemies = [
			// GameObjectFactory.create("enemy"),
			// GameObjectFactory.create("enemy"),
			// GameObjectFactory.create("enemy")
		]
		this.endboss = GameObjectFactory.create("endboss")
		SpawnManager.square("coin", new Vector(2000, 100), 100, Math.PI / 4)
		SpawnManager.arch("coin", new Vector(3000, 180), 200, 5)
		SpawnManager.line("coin", new Vector(1000, 80), 400, 5)
	}

	setupNewGame(): void {
		this.totalTime = 0
		MESSAGER.dispatch("input").isKeyInputBlocked = false
		this.allObjects = new Map()
		this.collisionManager.allObjects = new Map()
		this.setUpObjects()
		this.hasStarted = false
		this.countdownTimer?.kill()
		this.renderer.camera._focus = new Vector(0, 0)
		this.renderer.camera.focusObjects = [this.player]
		this.gui.initialize()
		this.update()
		this.startCountDown()
	}

	async startGame(): Promise<void> {
		MESSAGER.dispatch("input").isBlocked = false
		this.resume()
		this.player.setState("idle")
	}

	togglePause() {
		// console.log("toggling pause")
		this.isPaused ? this.resume() : this.pause()
	}

	pause() {
		window.dispatchEvent(new CustomEvent("pausegame"))
		this.isPaused = true
		console.log("pause")
	}

	resume() {
		this.initializeGamePauseOnVisibilityChange()
		window.dispatchEvent(new CustomEvent("resumegame"))
		this.isPaused = false
		console.log("resume")
	}

	private update() {
		this.renderer.render()
		this.triggerManager.check()
		requestAnimationFrame(() => this.update())
	}

	private initializeGamePauseOnVisibilityChange(): void {
		const input = MESSAGER.dispatch("input")
		document.addEventListener(
			"visibilitychange",
			(e) => {
				if (document.visibilityState === "visible") return
				input.pauseGame()
			},
			{ once: true }
		)
	}

	startCountDown(secondsLeft = 0): void {
		this.gui.updateCountDown(secondsLeft)
		if (secondsLeft === 0) {
			this.hasStarted = true
			this.startGame()
			return
		}
		this.countdownTimer = new Timer({
			handler: () => {
				this.startCountDown(secondsLeft - 1)
			},
			timeout: 1000,
			isPausable: false
		}).resume()
	}

	winGame(): void {
		console.log("Game Won!")
		this.endGame("won")
	}

	looseGame(): void {
		console.log("Game Over!")
		this.endGame("lost")
	}

	private endGame(state: "won" | "lost"): void {
		console.log(`${state} in ${formatTime(this.totalTime)}!`)
	}

	spawnEndboss(): void {
		console.log("spawning endboss")
		this.endboss.spawn()
	}
}
