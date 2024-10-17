import { AnimationSet, EndbossAnimationState } from "../.types/animation.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { GameObject, getImages, getSingleAnimation } from "./gameObject.object.js"

@Assets({
	img: [
		...getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4),
		...getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12),
		...getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20),
		...getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23),
		...getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26)
	]
})
export class Endboss extends GameObject {
	direction: 1 | -1 = 1
	states: (keyof stateMap)[] = ["walk", "alert", "attack", "hurt", "dead"]

	protected defaultState: keyof stateMap = "alert"

	constructor() {
		super("endboss")
		this.dimensions.set(1045, 1217).toScaled(0.5)
		this.position.set(700, 100)
		this.initialize()
	}

	protected initialize(): void {
		this.setBehaviours()
		super.initialize("4_enemie_boss_chicken/2_alert/A-5.png")
		this.setState()
	}

	protected setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		this.image = animationSet.alert[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", {
			damage: 40,
			targets: ["player", "bottle"],
			offsets: [100, 10, 20, 10]
		}).onAttach(this)
		this.resourceBehaviour = BehaviourFactory.create("resource", { healthPoints: 200 })
	}

	protected getAnimationSet(): Pick<AnimationSet, EndbossAnimationState> {
		return {
			walk: getImages(getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4)),
			alert: getImages(getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12)),
			attack: getImages(getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20)),
			hurt: getImages(getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23)),
			dead: getImages(getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26))
		}
	}
}
