import { Enemy } from "./enemy.object.js"

export class ChickenSmall extends Enemy {
	constructor() {
		super({
			size: "small",
			walkSpeed: 0.2,
			colliderOffsets: [10, 15, 10, 15]
		})
		this.dimensions.toScaled(0.5)
		console.log(this)
	}
}
