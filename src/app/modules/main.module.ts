import { MESSAGER } from "../../script.js"
import { GameObjectFactory } from "../factories/gameObject.factory.js"
import { Background } from "../gameObjects/background.object.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Player } from "../gameObjects/player.object.js"
import { Interval } from "./interval.module.js"
import { Renderer } from "./renderer.module.js"
import { Timer } from "./timer.module.js"
import { Vector } from "./vector.module.js"

export class Main {
	ctx
	isPaused = true
	frameRate = 60 / 1000
	currentFrame = 0
	gameLoop = new Interval({
		handler: () => this.update(),
		timeout: this.frameRate
	})

	renderer

	player
	background
	// tstBottle

	get allObjects(): GameObject[] {
		return [this.background, this.player]
	}

	constructor(public canvas: HTMLCanvasElement) {
		this.ctx = this.canvas.getContext("2d")!
		MESSAGER.elements.set("main", this)
		this.renderer = new Renderer(this.canvas)
		this.player = GameObjectFactory.create("player")
		this.background = GameObjectFactory.create("background")
		// this.tstBottle = GameObjectFactory.create("bottle", { position: new Vector(0, 200) })

		this.renderer.camera.focusObjects = [this.player]
	}

	startGame(): void {
		this.gameLoop.toggle()
		// this.togglePause()
		this.isPaused = false
	}

	togglePause() {
		// console.log("toggling pause")
		this.isPaused ? this.resume() : this.pause()
		this.isPaused = !this.isPaused
	}

	pause() {
		if (this.isPaused) return
		window.dispatchEvent(new CustomEvent("pausegame"))
	}

	resume() {
		if (!this.isPaused) return
		window.dispatchEvent(new CustomEvent("resumegame"))
	}

	private update() {
		this.renderer.render()
	}

	toggleRender() {
		this.gameLoop.toggle()
	}
}
