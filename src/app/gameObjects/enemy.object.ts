import { AnimationSet, EnemyAnimationState } from "../.types/animation.type.js"
import { StateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { randomize } from "../util/general.util.js"
import { GameObject, getImages, getSingleAnimation } from "./gameObject.object.js"

@Assets({
	img: [
		...getSingleAnimation(`3_enemies_chicken/chicken_normal/1_walk`, 1, 3),
		...getSingleAnimation(`3_enemies_chicken/chicken_small/1_walk`, 1, 3),
		...getSingleAnimation(`3_enemies_chicken/chicken_normal/2_dead`, 1),
		...getSingleAnimation(`3_enemies_chicken/chicken_small/2_dead`, 1)
	]
})
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

	protected initialize(): void {
		this.setBehaviours()
		super.initialize(`3_enemies_chicken/chicken_${this.size}/1_walk/W-1.png`)
		this.setState()
	}

	protected setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		this.image = animationSet.walk[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", {
			walkSpeed: this.walkSpeed,
			clampToWorld: true
		}).onAttach(this)
		this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this)
		this.health = BehaviourFactory.create("health", { maximum: 50 }).onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", { damage: 20 }).onAttach(this)
	}

	protected getAnimationSet(): Pick<AnimationSet, EnemyAnimationState> {
		return {
			walk: getImages(getSingleAnimation(`3_enemies_chicken/chicken_${this.size}/1_walk`, 1, 3)),
			dead: getImages(getSingleAnimation(`3_enemies_chicken/chicken_${this.size}/2_dead`, 1))
		}
	}

	protected randomizeStartingPosition(): void {
		const randomX = randomize(300, 1000)
		this.position.x = randomX
	}
}
