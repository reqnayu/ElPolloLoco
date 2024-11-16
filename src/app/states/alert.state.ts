import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class AlertState implements State {
	type: keyof stateMap = "alert"

	enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation(this.type)
	}

	update(gameObject: GameObject, deltaTime: number): void {}

	exit(gameObject: GameObject): void {}
}
