import { Enemy } from "./enemy.object.js"

export class ChickenNormal extends Enemy {
	protected walkSpeed: number = 0.5
	constructor() {
		super("normal")
		this.dimensions.toScaled(0.7)
	}
}
