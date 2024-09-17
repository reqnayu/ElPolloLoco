import { MESSAGER } from "../../script.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { clamp } from "../util/general.util.js"
import { Vector } from "./vector.module.js"

export class Camera {
	private _focus = new Vector(-1000, 0)
	private pixelsPerFrame = 5
	aspectRatio = 16 / 9
	baseResolution = new Vector(1280, 720)
	focusObjects: GameObject[] = []
	private maxPosX

	get focus(): Vector {
		const middleVec = new Vector(
			this.baseResolution.x / 2,
			// this.baseResolutionWidth / this.aspectRatio / 2
			0
		).scale(-1)
		const focusVector = this._focus.plus(middleVec)
		const x = clamp(focusVector.x, 0, this.maxPosX - this.baseResolution.x)
		const y = focusVector.y
		return new Vector(x, y)
	}

	constructor() {
		this.maxPosX = MESSAGER.dispatch("main").maxPosX
	}

	updateFocus() {
		if (this.focusObjects.length === 0) return
		const objectFocus = Vector.average(this.focusObjects.map(({ focusVector }) => focusVector))
		// objectFocus.x = clamp(objectFocus.x, 0, this.maxPosX)

		const distance = this._focus.plus(objectFocus.scale(-1))
		if (Math.abs(distance.x) <= 1) return (this._focus.x = objectFocus.x)
		const step = distance.normalize().scale(-this.pixelsPerFrame)
		this._focus.x += step.x
	}
}
