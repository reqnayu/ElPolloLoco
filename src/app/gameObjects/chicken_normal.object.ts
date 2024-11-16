import { AnimationSet, EnemyAnimationState } from "../.types/animation.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset.manager.js"
import { Settings } from "../modules/settings.module.js"
import { Enemy } from "./enemy.object.js"
import { getImages, getSingleAnimation } from "./gameObject.object.js"

@Assets({
	img: [
		...getSingleAnimation(`3_enemies_chicken/chicken_normal/1_walk`, 1, 3),
		...getSingleAnimation(`3_enemies_chicken/chicken_normal/2_dead`, 1)
	]
})
export class ChickenNormal extends Enemy {
	constructor() {
		super({
			type: "enemy",
			walkSpeed: 0.35,
			colliderOffsets: [10, 10, 10, 10],
			healthPoints: Settings.resources["enemyNormalHp"]
		})
		this.dimensions.toScaled(0.7)
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
			walk: getImages(getSingleAnimation(`3_enemies_chicken/chicken_normal/1_walk`, 1, 3)),
			dead: getImages(getSingleAnimation(`3_enemies_chicken/chicken_normal/2_dead`, 1))
		}
	}
}
