import GameObject from "../gameObjects/gameObject.object.js"
import Util from "../util/general.util.js"
import Main from "./main.module.js"
import Vector from "./vector.module.js"

export default class Camera {
	public static _focus = Vector.zero
	private static readonly pixelsPerFrame = 1.5
	public static readonly aspectRatio = 16 / 9
	public static readonly _baseResolution = new Vector(1280, 720)
	public static zoom = 1
	public static get Zoom(): number {
		return this.zoom
	}
	public static readonly maxZoom = 3
	private static readonly minZoom = 1
	public static focusObjects: GameObject[]

	public static get resolution(): Vector {
		return this._baseResolution.scale(this.zoom)
	}

	public static get focus(): Vector {
		const middleVec = this.resolution.scale(0.5)
		const focusVector = this._focus.plus(middleVec.scale(-1))
		// const x = clamp(focusVector.x, 0, this.maxPosX - this.resolution.x)
		return new Vector(focusVector.x, 0)
	}

	public static get desiredFocus(): Vector {
		const objectFocus = Vector.average(this.getStartAndEndFocusObjects().map(({ focusVector }) => focusVector))
		const minFocusX = this.resolution.scale(0.5).x
		objectFocus.x = Util.clamp(objectFocus.x, minFocusX, Main.maxPosX - minFocusX)
		return objectFocus
	}

	private static get desiredZoom(): number {
		if (this.focusObjects.length <= 1) return 1
		const [obj1, obj2] = this.getStartAndEndFocusObjects()
		const distance = obj2.position.x + obj2.Dimensions.x - obj1.position.x
		const paddingFactor = 1.2
		const desiredZoom = (distance / this._baseResolution.x) * paddingFactor
		return Util.clamp(desiredZoom, this.minZoom, this.maxZoom)
	}

	public static initialize(): void {
		this._focus = Vector.zero
		this.focusObjects = [Main.player]
	}

	public static update(deltaTime: number): void {
		this.updateFocus(deltaTime)
		this.updateZoom(deltaTime)
		// Display.update("zoom", this.desiredZoom)
		// Display.render()
	}

	private static updateZoom(deltaTime: number): void {
		if (this.zoom === this.desiredZoom) return
		const zoomFactor = 1 / 500
		const stepSize = (this.desiredZoom - this.zoom) * deltaTime * zoomFactor
		// if (stepSize < 0.0001) {
		// 	this.zoom = this.desiredZoom
		// 	return
		// }
		this.zoom += stepSize
	}

	private static updateFocus(deltaTime: number) {
		if (this.focusObjects.length === 0) return
		// objectFocus.x = clamp(objectFocus.x, 0, this.maxPosX)

		const distance = this._focus.plus(this.desiredFocus.scale(-1))
		if (Math.abs(distance.x) <= 1) return (this._focus.x = this.desiredFocus.x)
		const step = distance.normalize().scale(-this.pixelsPerFrame * deltaTime)
		this._focus.x += step.x
	}

	// changeZoom(dir: 1 | -1): void {
	// 	const stepSize = 0.1
	// 	this.zoom = clamp(this.zoom + dir * stepSize, this.minZoom, this.maxZoom)
	// }

	private static getStartAndEndFocusObjects(): [GameObject, GameObject] {
		const objects = this.focusObjects.sort((a, b) => a.position.x - b.position.x)
		return [objects[0], objects.at(-1)!]
	}
}
