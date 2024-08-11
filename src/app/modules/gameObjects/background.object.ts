import { BehaviourFactory } from "../../factories/behaviour.factory.js"
import { GameObject } from "./gameObject.object.js"

export class Background extends GameObject {
	constructor() {
		super("Background")
		// this.dimensions.set(400, 500)
		this.initialize()
	}

	protected initialize(): Promise<void> {
		// console.log("background created!")
		this.setBehaviours()
		return super.initialize("app/assets/img/5_background/layers/1_first_layer/full.png")
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
	}

	draw(ctx: CanvasRenderingContext2D): void {
		if (this.drawBehaviour === undefined) return
		const { width, height } = ctx.canvas
		this.dimensions.set(width, height)
		this.drawBehaviour?.draw(ctx)
	}
}
