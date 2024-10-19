import { MESSAGER } from "../../script.js"
import { AnimationSet, EndbossAnimationState } from "../.types/animation.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { Enemy } from "./enemy.object.js"
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
export class Endboss extends Enemy {
	direction: 1 | -1 = 1
	states: (keyof stateMap)[] = ["walk", "alert", "attack", "hurt", "dead"]

	protected defaultState: keyof stateMap = "alert"

	constructor() {
		super({
			type: "endboss",
			walkSpeed: 0.7,
			colliderOffsets: [200, 60, 70, 60],
			healthPoints: 400
		})
		this.dimensions.set(1045, 1217).toScaled(0.5)
		this.position.set(1500, 100)
		this.initialize()
	}

	protected initialize(): void {
		this.setBehaviours()
		super.setBehaviours()
		super.initialize()
		this.animationBehaviour?.setAnimation("alert")
		// this.setState()
	}

	protected setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		this.image = animationSet.alert[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
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

	collisionCallback(target: GameObject): void {
		super.collisionCallback(target)
		switch (target.name) {
			case "bottle": {
				const { currentAmount, maxAmount } = this.resourceBehaviour!.healthPoints
				return MESSAGER.dispatch("gui").updateStatusBar("endbossHp", currentAmount, maxAmount)
			}
			case "player":
				this.animationBehaviour?.setAnimation("attack", false, () => {
					this.animationBehaviour?.setAnimation("alert")
				})
		}
	}
}
