import {
	animationParams,
	behaviourMap,
	behaviourParamMap,
	collisionParams,
	drawParams,
	movementParams,
	resourceParams,
	soundParams
} from "../.types/behaviour.type.js"
import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { CollisionBehaviour } from "../behaviours/collision.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { ResourceBehaviour } from "../behaviours/resources.behaviour.js"
import { SoundBehaviour } from "../behaviours/sound.behaviour.js"

export class BehaviourFactory {
	private constructor() {}

	static create<T extends keyof behaviourMap>(type: T, options?: behaviourParamMap[T]): behaviourMap[T] {
		switch (type) {
			case "draw": {
				const params = options as drawParams
				if (params && params.isScaled === undefined) throw Error(`DrawParams Invalid!`)
				return new DrawBehaviour(params) as behaviourMap[T]
			}
			case "animation": {
				const params = options as animationParams
				if (params && params.animationSet === undefined) throw Error(`AnimationParams Invalid!`)

				return new AnimationBehaviour(params) as behaviourMap[T]
			}
			case "gravity":
				return new GravityBehaviour() as behaviourMap[T]
			case "movement": {
				const params = options as movementParams
				if (params && params.walkSpeed === undefined) throw Error(`AnimationParams Invalid!`)
				return new MovementBehaviour(params) as behaviourMap[T]
			}
			case "collision": {
				const params = options as collisionParams
				return new CollisionBehaviour(params) as behaviourMap[T]
			}
			case "sound": {
				return new SoundBehaviour() as behaviourMap[T]
			}
			case "resource": {
				const params = options as resourceParams
				return new ResourceBehaviour(params) as behaviourMap[T]
			}
			default:
				throw new Error(`behaviour of type '${type}' not found!`)
		}
	}
}
