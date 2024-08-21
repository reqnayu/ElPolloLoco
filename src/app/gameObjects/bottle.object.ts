import { BottleParams } from "../.types/gameObject.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { GameObject } from "./gameObject.object.js"

export class Bottle extends GameObject {
	constructor(options: BottleParams) {
		super("bottle")
		this.dimensions.set(400, 400).toScaled(0.5)
		this.position.setToVector(options.position)
		this.initialize()
	}

	protected initialize(): Promise<void> {
		// console.log("background created!")
		this.setBehaviours()
		return super.initialize("app/assets/img/6_salsa_bottle/salsa_bottle.png")
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
	}
}
