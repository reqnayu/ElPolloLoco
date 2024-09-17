import { State } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Timer } from "../modules/timer.module.js"

export class DeadState implements State {
	timers: Timer[] = []
	enter(gameObject: GameObject): void {}

	update(gameObject: GameObject, deltaTime: number): void {}

	exit(gameObject: GameObject): void {}
}
