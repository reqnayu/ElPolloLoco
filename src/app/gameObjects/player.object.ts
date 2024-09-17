import { AnimationSet, PlayerAnimationState } from "../.types/animation.type.js"
import { StateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Vector } from "../modules/vector.module.js"
import { GameObject, getSingleAnimation } from "./gameObject.object.js"

export class Player extends GameObject {
	protected walkSpeed = 40
	private jumpStrength = 50

	isFriendly: boolean = true

	protected defaultState: keyof StateMap = "idle"

	focusOffset = 400
	states: (keyof StateMap)[] = ["idle", "walk", "jump", "hurt", "dead"]

	protected getFocus(): Vector {
		return this.getCenterPoint().plus(new Vector(this.focusOffset * this.direction, 0))
	}

	constructor() {
		super("player")
		this.dimensions.set(610, 1200).toScaled(0.4)
		this.position.set(0, 100)
		this.initialize()
	}

	protected async initialize(): Promise<void> {
		await this.setBehaviours()
		await super.initialize("./app/assets/img/2_character_pepe/1_idle/idle/I-1.png")
		this.setState()
	}

	protected async setBehaviours(): Promise<void> {
		const animationSet = await this.getAnimationSet()
		const { walkSpeed, jumpStrength } = this
		this.image = animationSet.idle[0]

		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed, jumpStrength }).onAttach(this)
		this.gravityBehavoir = BehaviourFactory.create("gravity").onAttach(this)
		this.health = BehaviourFactory.create("health", { maximum: 200 }).onAttach(this)
		// this.collisionBehaviour = BehaviourFactory.create("collision").onAttach(this)
	}

	protected async getAnimationSet(): Promise<Pick<AnimationSet, PlayerAnimationState>> {
		return {
			idle: await getSingleAnimation("./app/assets/img/2_character_pepe/1_idle/idle", 1, 10),
			idle_long: await getSingleAnimation("./app/assets/img/2_character_pepe/1_idle/idle_long", 11, 20),
			walk: await getSingleAnimation("./app/assets/img/2_character_pepe/2_walk", 21, 26),
			jump: await getSingleAnimation("./app/assets/img/2_character_pepe/3_jump", 31, 39),
			hurt: await getSingleAnimation("./app/assets/img/2_character_pepe/4_hurt", 41, 43),
			dead: await getSingleAnimation("./app/assets/img/2_character_pepe/5_dead", 51, 57)
		}
	}

	canMove(): boolean {
		return this.input.isMovingLeft || this.input.isMovingRight
	}

	canJump(): boolean {
		return this.input.isJumping
	}
}
