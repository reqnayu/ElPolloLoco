import { Enemy } from "./enemy.object.js"

export class ChickenNormal extends Enemy {
	protected walkSpeed: number = 15
	constructor() {
		super("normal")
		this.dimensions.toScaled(0.7)
	}
}
