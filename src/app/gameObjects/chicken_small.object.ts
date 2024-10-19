import { MESSAGER } from "../../script.js"
import { AnimationSet, EnemyAnimationState } from "../.types/animation.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { Enemy } from "./enemy.object.js"
import { getImages, getSingleAnimation } from "./gameObject.object.js"

@Assets({
	img: [
		...getSingleAnimation(`3_enemies_chicken/chicken_small/1_walk`, 1, 3),
		...getSingleAnimation(`3_enemies_chicken/chicken_small/2_dead`, 1)
	]
})
export class ChickenSmall extends Enemy {
	constructor() {
		super({
			type: "enemy",
			walkSpeed: 0.2,
			colliderOffsets: [10, 15, 10, 15],
			healthPoints: MESSAGER.dispatch("main").settings.resources["enemySmallHp"]
		})
		this.dimensions.toScaled(0.5)
		this.initialize()
	}

	protected initialize(): void {
		this.setBehaviours()
		super.setBehaviours()
		super.initialize()
	}

	protected setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		this.image = animationSet.walk[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
	}

	protected getAnimationSet(): Pick<AnimationSet, EnemyAnimationState> {
		return {
			walk: getImages(getSingleAnimation(`3_enemies_chicken/chicken_small/1_walk`, 1, 3)),
			dead: getImages(getSingleAnimation(`3_enemies_chicken/chicken_small/2_dead`, 1))
		}
	}
}
