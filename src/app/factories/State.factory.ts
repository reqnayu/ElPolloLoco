import { stateMap } from "../.types/state.type.js"
import { AlertState } from "../states/alert.state.js"
import { AttackState } from "../states/attack.state.js"
import { DeadState } from "../states/dead.state.js"
import { HurtState } from "../states/hurt.state.js"
import { IdleState } from "../states/idle.state.js"
import { JumpState } from "../states/jump.state.js"
import { RotationState } from "../states/rotation.state.js"
import { WalkState } from "../states/walk.state.js"

export abstract class StateFactory {
	private constructor() {}

	static create<T extends keyof stateMap>(type: T): stateMap[T] {
		switch (type) {
			case "idle":
				return new IdleState() as stateMap[T]
			case "walk":
				return new WalkState() as stateMap[T]
			case "jump":
				return new JumpState() as stateMap[T]
			case "alert":
				return new AlertState() as stateMap[T]
			case "attack":
				return new AttackState() as stateMap[T]
			case "hurt":
				return new HurtState() as stateMap[T]
			case "dead":
				return new DeadState() as stateMap[T]
			case "rotation":
				return new RotationState() as stateMap[T]
			default:
				throw Error(`State of type '${type}' not found.`)
		}
	}
}
