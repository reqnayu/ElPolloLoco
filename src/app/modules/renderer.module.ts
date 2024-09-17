import { MESSAGER } from "../../script.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Camera } from "./camera.module.js"

export class Renderer {
	main
	camera
	private scale = 0.8

	constructor(private canvas: HTMLCanvasElement) {
		this.main = MESSAGER.dispatch("main")

		this.camera = new Camera()
		this.updateDimensions()
	}

	updateDimensions(): void {
		const { innerWidth, innerHeight } = window
		if (innerWidth === this.canvas.width) return
		const isDependantOnWidth = innerWidth / innerHeight < 16 / 9
		this.canvas.width = (isDependantOnWidth ? innerWidth : (innerHeight * 16) / 9) * this.scale
		this.canvas.height = (isDependantOnWidth ? (innerWidth * 9) / 16 : innerHeight) * this.scale
	}

	private wipe() {
		const { width, height } = this.canvas
		this.main.ctx.clearRect(0, 0, width, height)
	}

	render() {
		this.updateDimensions()
		this.wipe()
		if (!this.main.isPaused) this.camera.updateFocus()
		const { allObjects } = this.main
		allObjects.forEach(this.renderObject)

		this.main.currentFrame++
	}

	private renderObject = (gameObject: GameObject) => {
		gameObject.draw(this.main.ctx)
		if (!this.main.isPaused) gameObject.update(this.main.frameRate)
	}

	toggleFullscreen(): Promise<void> {
		if (document.fullscreenElement) return document.exitFullscreen()
		return this.main.gameElement.requestFullscreen()
	}
}
