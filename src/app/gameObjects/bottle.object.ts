import { AnimationSet, BottleAnimationState } from "../.types/animation.type.js"
import { BottleParams } from "../.types/gameObject.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets, getAsset } from "../managers/asset_manager.module.js"
import { GameObject } from "./gameObject.object.js"

@Assets({
	img: [
		"6_salsa_bottle/salsa_bottle.png",
		"6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
		"6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
		"6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
		"6_salsa_bottle/bottle_rotation/4_bottle_rotation.png"
	]
})
export class Bottle extends GameObject {
	states: (keyof stateMap)[] = ["rotation"]
	protected defaultState: keyof stateMap = "rotation"
	isFriendly: boolean = true

	constructor({ position, direction }: BottleParams) {
		super("bottle")
		this.dimensions.set(400, 400).toScaled(0.5)
		this.position.setToVector(position)
		this.direction = direction
		this.initialize()
	}

	protected initialize(): void {
		// console.log("background created!")
		this.setBehaviours()
		super.initialize("6_salsa_bottle/salsa_bottle.png")
		this.setState()
	}

	protected setBehaviours(): void {
		const animationSet: Pick<AnimationSet, BottleAnimationState> = {
			rotation: [
				getAsset<"img">("6_salsa_bottle/bottle_rotation/1_bottle_rotation.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/2_bottle_rotation.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/3_bottle_rotation.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/4_bottle_rotation.png")
			]
		}
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: 1, jumpStrength: 1 }).onAttach(this)
		this.movementBehaviour.input.isMovingLeft = this.direction === -1
		this.movementBehaviour.input.isMovingRight = this.direction === 1
		this.movementBehaviour.jump()
		this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", { offsets: [30, 30, 30, 30] }).onAttach(this)
	}
}
