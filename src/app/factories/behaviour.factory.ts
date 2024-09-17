import {
	AnimationParams,
	BehaviourMap,
	BehaviourParamMap,
	CollisionParams,
	DrawParams,
	HealthParams,
	MovementParams
} from "../.types/behaviour.type.js"
import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { CollisionBehaviour } from "../behaviours/collision.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { HealthBehaviour } from "../behaviours/health.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"

export class BehaviourFactory {
	private constructor() {}

	static create<T extends keyof BehaviourMap>(type: T, options?: BehaviourParamMap[T]): BehaviourMap[T] {
		switch (type) {
			case "draw": {
				const params = options as DrawParams
				if (params && params.isScaled === undefined) throw Error(`DrawParams Invalid!`)
				return new DrawBehaviour(params) as BehaviourMap[T]
			}
			case "animation": {
				const params = options as AnimationParams
				if (params && params.animationSet === undefined) throw Error(`AnimationParams Invalid!`)

				return new AnimationBehaviour(params) as BehaviourMap[T]
			}
			case "gravity":
				return new GravityBehaviour() as BehaviourMap[T]
			case "movement": {
				const params = options as MovementParams
				if (params && params.walkSpeed === undefined) throw Error(`AnimationParams Invalid!`)
				return new MovementBehaviour(params) as BehaviourMap[T]
			}
			case "health": {
				const params = options as HealthParams
				if (params && params.maximum === undefined) throw Error(`HealthParams Invalid!`)
				return new HealthBehaviour(params) as BehaviourMap[T]
			}
			case "collision": {
				const params = options as CollisionParams
				if (params && params.damage === undefined) throw Error(`CollisionParams Invalid!`)
				return new CollisionBehaviour(params) as BehaviourMap[T]
			}
			default:
				throw new Error(`behaviour of type '${type}' not found!`)
		}
	}
}
