import { MESSAGER } from "../../script.js"
import { GameObjectFactory } from "../factories/gameObject.factory.js"
import { Background } from "./gameObjects/background.object.js"
import { GameObject } from "./gameObjects/gameObject.object.js"
import { Player } from "./gameObjects/player.object.js"
import { Interval } from "./interval.module.js"
import { Renderer } from "./renderer.module.js"

export class Main {
	ctx
	isPaused = true
	frameRate = 60 / 1000
	currentFrame = 0
	gameLoop = new Interval(() => this.update(), this.frameRate, false)

	renderer

	player: Player = GameObjectFactory.create("player")
	background: Background = GameObjectFactory.create("background")

	get allObjects(): GameObject[] {
		return [this.background, this.player]
	}

	constructor(public canvas: HTMLCanvasElement) {
		this.ctx = this.canvas.getContext("2d")!
		MESSAGER.elements.set("main", this)
		this.renderer = new Renderer(this.canvas)
	}

	startGame(): void {
		this.gameLoop.toggle()
		this.togglePause()
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
		this.render()
	}

	private render() {
		this.renderer.wipe()
		this.allObjects.forEach(this.renderObject)
		this.currentFrame++
	}

	private renderObject = (gameObject: GameObject) => {
		// console.log("rendering object")
		gameObject.draw(this.ctx)
		if (!this.isPaused) gameObject.update(this.frameRate)
	}

	toggleRender() {
		this.gameLoop.toggle()
	}
}
