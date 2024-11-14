import { MESSAGER } from "../../script.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Display } from "../util/devtools.util.js"
import { clamp } from "../util/general.util.js"
import { Vector } from "./vector.module.js"

export class Camera {
	_focus = new Vector(0, 0)
	private pixelsPerFrame = 1.5
	readonly aspectRatio = 16 / 9
	readonly _baseResolution = new Vector(1280, 720)
	zoom = 1
	readonly maxZoom = 3
	readonly minZoom = 1
	focusObjects: GameObject[] = []
	private maxPosX

	get resolution(): Vector {
		return this._baseResolution.scale(this.zoom)
	}

	get focus(): Vector {
		const middleVec = this.resolution.scale(0.5)
		const focusVector = this._focus.plus(middleVec.scale(-1))
		// const x = clamp(focusVector.x, 0, this.maxPosX - this.resolution.x)
		return new Vector(focusVector.x, 0)
	}

	get desiredFocus(): Vector {
		const objectFocus = Vector.average(this.getStartAndEndFocusObjects().map(({ focusVector }) => focusVector))
		const minFocusX = this.resolution.scale(0.5).x
		objectFocus.x = clamp(objectFocus.x, minFocusX, this.maxPosX - minFocusX)
		return objectFocus
	}

	get desiredZoom(): number {
		if (this.focusObjects.length <= 1) return 1
		const [obj1, obj2] = this.getStartAndEndFocusObjects()
		const distance = obj2.position.x + obj2.dimensions.x - obj1.position.x
		const paddingFactor = 1.2
		const desiredZoom = (distance / this._baseResolution.x) * paddingFactor
		return clamp(desiredZoom, this.minZoom, this.maxZoom)
	}

	constructor() {
		this.maxPosX = MESSAGER.dispatch("main").maxPosX
		Display.new(`zoom`)
	}

	update(deltaTime: number): void {
		this.updateFocus(deltaTime)
		this.updateZoom(deltaTime)
		// Display.update("zoom", this.desiredZoom)
		// Display.render()
	}

	private updateZoom(deltaTime: number): void {
		if (this.zoom === this.desiredZoom) return
		const zoomFactor = 1 / 500
		const stepSize = (this.desiredZoom - this.zoom) * deltaTime * zoomFactor
		// if (stepSize < 0.0001) {
		// 	this.zoom = this.desiredZoom
		// 	return
		// }
		this.zoom += stepSize
	}

	private updateFocus(deltaTime: number) {
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

	private getStartAndEndFocusObjects(): [GameObject, GameObject] {
		const objects = this.focusObjects.sort((a, b) => a.position.x - b.position.x)
		return [objects[0], objects.at(-1)!]
	}
}
