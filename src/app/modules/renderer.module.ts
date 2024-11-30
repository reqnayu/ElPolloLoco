import { GameObjectType } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import CollisionManager from "../managers/collision.manager.js"
import Display from "../util/devtools.util.js"
import Util from "../util/general.util.js"
import Camera from "./camera.module.js"
import Main from "./main.module.js"
import Vector from "./vector.module.js"

export default abstract class Renderer {
	private static currentFrame = 0
	private static timeOfLastFrame = 0
	private static windowScale = 0.8
	private static orderOfObjects: GameObjectType[] = [
		"background",
		"clouds",
		"enemy",
		"endboss",
		"coin",
		"player",
		"bottle"
	]

	private static fps = 0
	private static frameTimes: number[] = []
	private static numFramesToAverage = 30

	private static calculateFps(deltaTime: number): void {
		this.frameTimes.push(deltaTime)
		if (this.frameTimes.length > this.numFramesToAverage) {
			this.frameTimes.shift()
		}

		const averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
		this.fps = 1000 / averageFrameTime
	}

	public static initialize(): void {
		this.staticDimensionUpdate()
	}

	public static reset(): void {
		this.fps = 0
		this.frameTimes = []
		this.timeOfLastFrame = 0
	}

	public static updateDimensions(): void {
		const { x, y } = this.getAvailableWindowDimensions()
		const isDependantOnWidth = x / y < 16 / 9
		const desiredWidth = Math.floor(isDependantOnWidth ? x : (y * 16) / 9)
		if (desiredWidth === Main.canvas.width) return
		document.documentElement.style.setProperty("--game-width", `${desiredWidth}px`)
		Main.canvas.width = desiredWidth
		Main.canvas.height = Math.floor(isDependantOnWidth ? (x * 9) / 16 : y)
	}

	private static wipe() {
		const { width, height } = Main.canvas
		Main.ctx.clearRect(0, 0, width, height)
	}

	public static render() {
		const now = Date.now()
		this.wipe()
		const deltaTime = now - this.timeOfLastFrame
		this.timeOfLastFrame = now

		this.getSortedObjects().forEach((gameObject) => this.renderObject(gameObject, deltaTime))
		if (this.shouldUpdate()) this.update(deltaTime)

		this.calculateFps(deltaTime)
		this.displayPerformanceMetrics()
		Display.render()
	}

	private static update(deltaTime: number): void {
		Main.totalTime += deltaTime
		this.currentFrame++
		Camera.update(deltaTime)
		CollisionManager.checkAll()
	}

	private static displayPerformanceMetrics(): void {
		Util.getElement("#fps-counter").innerHTML = Util.roundTo(this.fps).toString()
	}

	private static renderObject = (gameObject: GameObject, deltaTime: number) => {
		gameObject.draw(Main.ctx)
		if (this.shouldUpdate()) gameObject.update(deltaTime)
	}

	public static toggleFullscreen(): Promise<void> {
		if (document.fullscreenElement) return document.exitFullscreen()
		return Main.GameElement.requestFullscreen()
	}

	private static getAvailableWindowDimensions(): Vector {
		const x = document.fullscreenElement?.clientWidth || window.innerWidth * this.windowScale
		const y = document.fullscreenElement?.clientHeight || window.innerHeight * this.windowScale
		return new Vector(x, y)
	}

	private static shouldUpdate(): boolean {
		return Main.hasStarted && !Main.isPaused
	}

	private static getSortedObjects(): GameObject[] {
		return Array.from(Main.allObjects)
			.map(([id, obj]) => obj)
			.sort((a, b) => this.orderOfObjects.indexOf(a.name)! - this.orderOfObjects.indexOf(b.name)!)
	}

	private static staticDimensionUpdate(): void {
		this.updateDimensions()
		requestAnimationFrame(() => this.staticDimensionUpdate())
	}
}
