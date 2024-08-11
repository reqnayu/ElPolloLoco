import {
	AnimationParams,
	BehaviourMap,
	BehaviourParamMap,
	BehaviourType,
	MovementParams
} from "../.types/behaviour.type.js"
import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"

export class BehaviourFactory {
	static create<T extends BehaviourType>(type: T, options?: BehaviourParamMap[T]): BehaviourMap[T] {
		switch (type) {
			case "draw":
				return new DrawBehaviour() as BehaviourMap[T]
			case "animation": {
				const params = options as AnimationParams
				if (params.animationSet === undefined) throw Error(`AnimationParams Invalid!`)

				return new AnimationBehaviour(params) as BehaviourMap[T]
			}
			case "gravity":
				return new GravityBehaviour() as BehaviourMap[T]
			case "movement":
				const params = options as MovementParams
				if (params.walkSpeed === undefined) throw Error(`AnimationParams Invalid!`)
				return new MovementBehaviour(params) as BehaviourMap[T]
			default:
				throw new Error(`behaviour of type '${type}' not found!`)
		}
	}
}
