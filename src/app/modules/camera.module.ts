import { GameObject } from "../gameObjects/gameObject.object.js"
import { Vector } from "./vector.module.js"

export class Camera {
	private _focus = new Vector(-1000, 0)
	private pixelsPerFrame = 3
	private aspectRatio = 16 / 9
	focusObjects: GameObject[] = []

	get focus(): Vector {
		const middleVec = new Vector(
			this.baseResolutionWidth / 2,
			// this.baseResolutionWidth / this.aspectRatio / 2
			0
		).scale(-1)
		return this._focus.plus(middleVec)
	}

	constructor(private baseResolutionWidth: number) {
		console.log("new Camera Added")
	}

	updateFocus() {
		if (this.focusObjects.length === 0) return
		const focus = Vector.average(this.focusObjects.map(({ focusVector }) => focusVector))
		const distance = this._focus.plus(focus.scale(-1))
		if (Math.abs(distance.x) <= 1) return (this._focus.x = focus.x)
		const step = distance.normalize().scale(-this.pixelsPerFrame)
		this._focus.x += step.x
	}
}
