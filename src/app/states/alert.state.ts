import { State, stateMap } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class AlertState implements State {
	type: keyof stateMap = "attack"

	enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation(this.type)
	}

	update(gameObject: GameObject, deltaTime: number): void {}

	exit(gameObject: GameObject): void {}
}
