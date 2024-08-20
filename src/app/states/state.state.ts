import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export interface State {
	timers: Timer[]
	enter(gameObject: GameObject): void
	update(gameObject: GameObject, deltaTime: number): void
	exit(gameObject: GameObject): void
}
