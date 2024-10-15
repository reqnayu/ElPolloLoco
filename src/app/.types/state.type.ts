import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"
import { AlertState } from "../states/alert.state.js"
import { AttackState } from "../states/attack.state.js"
import { DeadState } from "../states/dead.state.js"
import { HurtState } from "../states/hurt.state.js"
import { IdleState } from "../states/idle.state.js"
import { JumpState } from "../states/jump.state.js"
import { RotationState } from "../states/rotation.state.js"
import { WalkState } from "../states/walk.state.js"

export type stateMap = {
	idle: IdleState
	walk: WalkState
	jump: JumpState
	alert: AlertState
	attack: AttackState
	dead: DeadState
	hurt: HurtState
	rotation: RotationState
}

export interface State {
	type: keyof stateMap
	timers?: Timer[]
	enter(gameObject: GameObject): void
	update(gameObject: GameObject, deltaTime: number): void
	exit(gameObject: GameObject): void
}
