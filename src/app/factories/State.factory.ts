import { stateMap } from "../.types/types.js"
import AlertState from "../states/alert.state.js"
import AttackState from "../states/attack.state.js"
import DeadState from "../states/dead.state.js"
import HurtState from "../states/hurt.state.js"
import IdleState from "../states/idle.state.js"
import JumpState from "../states/jump.state.js"
import RotationState from "../states/rotation.state.js"
import WalkState from "../states/walk.state.js"

const States: Record<keyof stateMap, any> = {
	idle: IdleState,
	walk: WalkState,
	jump: JumpState,
	alert: AlertState,
	attack: AttackState,
	hurt: HurtState,
	dead: DeadState,
	rotation: RotationState
}

export default abstract class StateFactory {
	public static create<T extends keyof stateMap>(type: T): stateMap[T] {
		return new States[type]() as stateMap[T]
	}
}
