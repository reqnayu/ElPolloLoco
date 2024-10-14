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
import { getElement, sleep } from "../util/general.util.js"

export class Main {
	ctx
	isPaused = true
	readonly frameRate = 60 / 1000
	readonly maxPosX = 10 * 1000

	hasStarted = false
	countdownTimer?: Timer

	renderer!: Renderer
	soundManager!: SoundManager
	timerManager!: TimerManager
	collisionManager!: CollisionManager
	settings!: Settings
	gui!: Gui

	player!: Player
	background!: Background
	clouds!: Clouds
	enemies!: Enemy[]
	// tstBottle

	get allObjects(): GameObject[] {
		return [this.background, this.clouds, ...this.enemies, this.player]
	}

	constructor(public canvas: HTMLCanvasElement, public gameElement: HTMLElement) {
		this.ctx = this.canvas.getContext("2d")!
		MESSAGER.elements.set("main", this)
	}

	async initialize(): Promise<void> {
		this.initializeGamePauseOnVisibilityChange()
		this.renderer = new Renderer(this.canvas)
		await loadAssets()
		this.soundManager = new SoundManager()
		this.timerManager = new TimerManager()
		this.collisionManager = new CollisionManager()
		this.settings = new Settings()
		this.gui = new Gui()
	}

	setupNewGame(): void {
		MESSAGER.dispatch("input").isKeyInputBlocked = false
		this.collisionManager.allObjects.length = 0
		this.hasStarted = false
		this.countdownTimer?.kill()
		this.background = GameObjectFactory.create("background")
		this.clouds = GameObjectFactory.create("clouds")
		this.player = GameObjectFactory.create("player")
		this.enemies = [
			// GameObjectFactory.create("enemy"),
			// GameObjectFactory.create("enemy"),
			GameObjectFactory.create("enemy")
		]
		// this.tstBottle = GameObjectFactory.create("bottle", { position: new Vector(0, 200) })
		this.renderer.camera._focus = new Vector(0, 0)
		this.renderer.camera.focusObjects = [this.player]
		this.update()
		this.startCountDown()
	}

	async startGame(): Promise<void> {
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
	}

	resume() {
		window.dispatchEvent(new CustomEvent("resumegame"))
		this.isPaused = false
	}

	private update() {
		this.renderer.render()
		requestAnimationFrame(() => this.update())
	}

	private initializeGamePauseOnVisibilityChange(): void {
		document.addEventListener("visibilitychange", (e) => {
			if (document.visibilityState === "visible") return
			this.pause()
		})
	}

	startCountDown(secondsLeft = 1): void {
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
}
