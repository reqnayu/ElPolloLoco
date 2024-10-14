import { MESSAGER } from "../../script.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Camera } from "./camera.module.js"
import { Vector } from "./vector.module.js"

export class Renderer {
	main
	camera
	currentFrame = 0
	private timeOfLastFrame = 0
	private windowScale = 0.8

	constructor(private canvas: HTMLCanvasElement) {
		this.main = MESSAGER.dispatch("main")

		this.camera = new Camera()
		this.updateDimensions()
	}

	updateDimensions(): void {
		const { x, y } = this.getAvailableWindowDimensions()
		const isDependantOnWidth = x / y < 16 / 9
		const desiredWidth = Math.floor(isDependantOnWidth ? x : (y * 16) / 9)
		if (desiredWidth === this.canvas.width) return
		document.documentElement.style.setProperty("--game-width", `${desiredWidth}px`)
		this.canvas.width = desiredWidth
		this.canvas.height = Math.floor(isDependantOnWidth ? (x * 9) / 16 : y)
	}

	private wipe() {
		const { width, height } = this.canvas
		this.main.ctx.clearRect(0, 0, width, height)
	}

	private readonly desiredFps = 60
	private readonly frameDuration = 1000 / this.desiredFps

	render() {
		this.updateDimensions()
		this.wipe()
		const { allObjects } = this.main
		let deltaTime = 0
		const now = Date.now()

		// if (now - this.timeOfLastFrame >= this.frameDuration) {
		deltaTime = now - this.timeOfLastFrame
		this.timeOfLastFrame = now
		// }

		if (this.shouldUpdate()) {
			this.currentFrame++
			this.camera.updateFocus(deltaTime)
			this.main.collisionManager.checkAll()
		}
		allObjects.forEach((gameObject) => this.renderObject(gameObject, deltaTime))
	}

	private renderObject = (gameObject: GameObject, deltaTime: number) => {
		gameObject.draw(this.main.ctx)
		if (this.shouldUpdate()) gameObject.update(deltaTime)
	}

	toggleFullscreen(): Promise<void> {
		if (document.fullscreenElement) return document.exitFullscreen()
		return this.main.gameElement.requestFullscreen()
	}

	private getAvailableWindowDimensions(): Vector {
		const x = document.fullscreenElement?.clientWidth || window.innerWidth * this.windowScale
		const y = document.fullscreenElement?.clientHeight || window.innerHeight * this.windowScale
		return new Vector(x, y)
	}

	private shouldUpdate(): boolean {
		return this.main.hasStarted && !this.main.isPaused
	}
}
