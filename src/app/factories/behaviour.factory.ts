import {
	animationParams,
	behaviourMap,
	behaviourParamMap,
	collisionParams,
	drawParams,
	gravityParams,
	movementParams,
	resourceAmountParams,
	soundParams,
	triggerParams
} from "../.types/types.js"
import AnimationBehaviour from "../behaviours/animation.behaviour.js"
import CollisionBehaviour from "../behaviours/collision.behaviour.js"
import DrawBehaviour from "../behaviours/draw.behaviour.js"
import GravityBehaviour from "../behaviours/gravity.behaviour.js"
import MovementBehaviour from "../behaviours/movement.behaviour.js"
import ResourceBehaviour from "../behaviours/resources.behaviour.js"
import SoundBehaviour from "../behaviours/sound.behaviour.js"
import TriggerBehaviour from "../behaviours/trigger.behaviour.js"

export default abstract class BehaviourFactory {
	public static create<T extends keyof behaviourMap>(type: T, options?: behaviourParamMap[T]): behaviourMap[T] {
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
				const params = options as gravityParams
				return new GravityBehaviour(params) as behaviourMap[T]
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
				const params = options as soundParams
				return new SoundBehaviour(params) as behaviourMap[T]
			}
			case "resource": {
				const params = options as resourceAmountParams
				return new ResourceBehaviour(params) as behaviourMap[T]
			}
			case "trigger": {
				const triggers = options as triggerParams
				return new TriggerBehaviour(triggers) as behaviourMap[T]
			}
			default:
				throw new Error(`behaviour of type '${type}' not found!`)
		}
	}
}
