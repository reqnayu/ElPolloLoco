import { AnimationSet, EnemyAnimationState } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Settings from "../modules/settings.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"
import Enemy from "./enemy.object.js"
import GameObject from "./gameObject.object.js"

@Util.Assets({
	img: [
		...GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/1_walk`, 1, 3),
		...GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/2_dead`, 1)
	]
})
export default class ChickenNormal extends Enemy {
	constructor(spawnPosition: Vector) {
		super({
			type: "enemy",
			spawnPosition,
			walkSpeed: 0.35,
			colliderOffsets: [10, 10, 10, 10],
			healthPoints: Settings.resources["enemyNormalHp"]
		})
		this.dimensions.toScaled(0.7)
		this.initialize()
	}

	protected override initialize(): void {
		this.setBehaviours()
		super.setBehaviours()
		super.initialize()
	}

	protected override setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		this.image = animationSet.walk[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
	}

	protected getAnimationSet(): Pick<AnimationSet, EnemyAnimationState> {
		return {
			walk: GameObject.getImages(GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/1_walk`, 1, 3)),
			dead: GameObject.getImages(GameObject.getSingleAnimation(`3_enemies_chicken/chicken_normal/2_dead`, 1))
		}
	}
}
