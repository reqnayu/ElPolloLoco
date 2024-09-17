import { MESSAGER } from "../../script.js"
import { GameObjectFactory } from "../factories/gameObject.factory.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Gui } from "./gui.module.js"
import { Interval } from "./interval.module.js"
import { Renderer } from "./renderer.module.js"
import { Settings } from "./settings.module.js"

export class Main {
	ctx
	isPaused = true
	frameRate = 60 / 1000
	currentFrame = 0
	maxPosX = 10 * 1000
	gameLoop = new Interval({
		handler: () => this.update(),
		timeout: this.frameRate
	})

	renderer
	gui = new Gui()
	settings = new Settings()

	player
	background
	clouds
	enemies
	// tstBottle

	get allObjects(): GameObject[] {
		return [this.background, this.clouds, ...this.enemies, this.player]
	}

	constructor(public canvas: HTMLCanvasElement, public gameElement: HTMLElement) {
		this.ctx = this.canvas.getContext("2d")!
		MESSAGER.elements.set("main", this)
		this.renderer = new Renderer(this.canvas)
		this.background = GameObjectFactory.create("background")
		this.clouds = GameObjectFactory.create("clouds")
		this.player = GameObjectFactory.create("player")
		this.enemies = [
			// GameObjectFactory.create("enemy"),
			// GameObjectFactory.create("enemy"),
			GameObjectFactory.create("enemy")
		]
		// this.tstBottle = GameObjectFactory.create("bottle", { position: new Vector(0, 200) })

		this.renderer.camera.focusObjects = [this.player]
		this.initializeGamePauseOnVisibilityChange()
	}

	startGame(): void {
		this.gameLoop.toggle()
		// this.togglePause()
		this.isPaused = false
	}

	togglePause() {
		// console.log("toggling pause")
		this.isPaused ? this.resume() : this.pause()
	}

	pause() {
		if (this.isPaused) return
		window.dispatchEvent(new CustomEvent("pausegame"))
		console.log("pausing")
		this.gui.elements["pause-screen"].classList.add("open")
		this.isPaused = true
	}

	resume() {
		if (!this.isPaused) return
		window.dispatchEvent(new CustomEvent("resumegame"))
		this.gui.elements["pause-screen"].classList.remove("open")
		this.isPaused = false
	}

	private update() {
		this.renderer.render()
	}

	toggleRender() {
		this.gameLoop.toggle()
	}

	private initializeGamePauseOnVisibilityChange(): void {
		document.addEventListener("visibilitychange", (e) => {
			if (document.visibilityState === "visible") return
			this.pause()
		})
	}
}
