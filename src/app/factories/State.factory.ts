import { StateMap } from "../.types/state.type.js"
import { DeadState } from "../states/dead.state.js"
import { HurtState } from "../states/hurt.state.js"
import { IdleState } from "../states/idle.state.js"
import { JumpState } from "../states/jump.state.js"
import { WalkState } from "../states/walk.state.js"

export class StateFactory {
	private constructor() {}

	static create<T extends keyof StateMap>(type: T): StateMap[T] {
		switch (type) {
			case "idle":
				return new IdleState() as StateMap[T]
			case "walk":
				return new WalkState() as StateMap[T]
			case "jump":
				return new JumpState() as StateMap[T]
			case "hurt":
				return new HurtState() as StateMap[T]
			case "dead":
				return new DeadState() as StateMap[T]
			default:
				throw Error(`State of type '${type}' not found.`)
		}
	}
}
