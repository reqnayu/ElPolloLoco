import { AnimationSet, EnemyAnimationState } from "../.types/animation.type.js"
import { StateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { randomize } from "../util/general.util.js"
import { GameObject, getSingleAnimation } from "./gameObject.object.js"

export class Enemy extends GameObject {
	direction: 1 | -1 = -1
	states: (keyof StateMap)[] = ["walk", "dead"]

	protected defaultState: keyof StateMap = "walk"

	constructor(private size: "small" | "normal") {
		super("enemy")
		this.dimensions.set(236, 210)
		this.randomizeStartingPosition()
		this.initialize()
	}

	protected async initialize(): Promise<void> {
		await this.setBehaviours()
		await super.initialize(`./app/assets/img/3_enemies_chicken/chicken_${this.size}/1_walk/W-1.png`)
		this.setState()
	}

	protected async setBehaviours(): Promise<void> {
		const animationSet = await this.getAnimationSet()
		this.image = animationSet.walk[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: this.walkSpeed }).onAttach(this)
		this.gravityBehavoir = BehaviourFactory.create("gravity").onAttach(this)
		this.health = BehaviourFactory.create("health", { maximum: 50 }).onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", { damage: 20 }).onAttach(this)
	}

	protected async getAnimationSet(): Promise<Pick<AnimationSet, EnemyAnimationState>> {
		return {
			walk: await getSingleAnimation(`./app/assets/img/3_enemies_chicken/chicken_${this.size}/1_walk`, 1, 3),
			dead: await getSingleAnimation(`./app/assets/img/3_enemies_chicken/chicken_${this.size}/2_dead`, 1)
		}
	}

	protected randomizeStartingPosition(): void {
		const randomX = randomize(300, 1000)
		this.position.x = randomX
	}
}
