import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Timer from "../modules/timer.module.js"

export default class AttackState implements State {
	type: keyof stateMap = "attack"
	timers: Timer[] = []

	enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation(this.type, () => {
			gameObject.setState("alert")
		})
	}

	update(gameObject: GameObject, deltaTime: number): void {}

	exit(gameObject: GameObject): void {}
}
