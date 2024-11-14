import { MESSAGER } from "../../script.js"
import { GameObjectType } from "../.types/gameObject.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { getElement, roundTo } from "../util/general.util.js"
import { Camera } from "./camera.module.js"
import { Vector } from "./vector.module.js"

export class Renderer {
	shouldUpdateStatically = true
	main
	camera
	currentFrame = 0
	private timeOfLastFrame = 0
	private windowScale = 0.8
	private orderOfObjects: GameObjectType[] = ["background", "clouds", "enemy", "endboss", "coin", "player", "bottle"]

	private lastTime = 0
	private fps = 0
	private frameTimes: number[] = []
	private numFramesToAverage = 30

	private calculateFps(deltaTime: number): void {
		const currentTime = Date.now()
		const frameTime = currentTime - this.lastTime
		this.lastTime = currentTime

		this.frameTimes.push(frameTime)
		if (this.frameTimes.length > this.numFramesToAverage) {
			this.frameTimes.shift()
		}

		const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
		this.fps = 1000 / averageFrameTime
	}

	constructor(private canvas: HTMLCanvasElement) {
		this.main = MESSAGER.dispatch("main")

		this.camera = new Camera()
		// this.updateDimensions()
		this.staticDimensionUpdate()
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
		const now = Date.now()
		let deltaTime = 0
		// if (now - this.timeOfLastFrame >= this.frameDuration) {
		this.updateDimensions()
		this.wipe()

		deltaTime = now - this.timeOfLastFrame
		this.timeOfLastFrame = now

		if (this.shouldUpdate()) {
			this.main.totalTime += deltaTime
			this.currentFrame++
			this.camera.update(deltaTime)
			this.main.collisionManager.checkAll()
		}
		this.getSortedObjects().forEach((gameObject) => this.renderObject(gameObject, deltaTime))

		this.calculateFps(deltaTime)
		this.displayPerformanceMetrics()
		// }
	}

	private displayPerformanceMetrics(): void {
		getElement("#fps-counter").innerHTML = roundTo(this.fps).toString()
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

	private getSortedObjects(): GameObject[] {
		return Array.from(this.main.allObjects)
			.map(([id, obj]) => obj)
			.sort((a, b) => this.orderOfObjects.indexOf(a.name)! - this.orderOfObjects.indexOf(b.name)!)
	}

	private staticDimensionUpdate(): void {
		if (this.shouldUpdateStatically === false) return
		this.updateDimensions()
		requestAnimationFrame(() => this.staticDimensionUpdate())
	}
}
