import { Enemy } from "./enemy.object.js"

export class ChickenSmall extends Enemy {
	protected walkSpeed: number = 0.2
	constructor() {
		super("small")
		this.dimensions.toScaled(0.5)
	}
}
