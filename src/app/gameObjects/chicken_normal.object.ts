import { Enemy } from "./enemy.object.js"

export class ChickenNormal extends Enemy {
	constructor() {
		super({
			size: "normal",
			walkSpeed: 0.35,
			colliderOffsets: [10, 10, 10, 10]
		})
		this.dimensions.toScaled(0.7)
		console.log(this)
	}
}
