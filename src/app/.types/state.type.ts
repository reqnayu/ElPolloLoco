import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"
import { DeadState } from "../states/dead.state.js"
import { HurtState } from "../states/hurt.state.js"
import { IdleState } from "../states/idle.state.js"
import { JumpState } from "../states/jump.state.js"
import { WalkState } from "../states/walk.state.js"

export type StateMap = {
	idle: IdleState
	walk: WalkState
	jump: JumpState
	dead: DeadState
	hurt: HurtState
}

export interface State {
	timers: Timer[]
	enter(gameObject: GameObject): void
	update(gameObject: GameObject, deltaTime: number): void
	exit(gameObject: GameObject): void
}
