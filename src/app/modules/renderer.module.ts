import { MESSAGER } from "../../script.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Camera } from "./camera.module.js"
import { Vector } from "./vector.module.js"

export class Renderer {
	main
	camera
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

	private getAvailableWindowDimensions(): Vector {
		const x = document.fullscreenElement?.clientWidth || window.innerWidth * this.windowScale
		const y = document.fullscreenElement?.clientHeight || window.innerHeight * this.windowScale
		return new Vector(x, y)
	}
}
