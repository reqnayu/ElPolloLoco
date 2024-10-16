import { Updateable } from "../.types/behaviours.interface.js"
import { State, stateMap } from "../.types/state.type.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class RotationState implements State {
	type: keyof stateMap = "rotation"
	enter(gameObject: GameObject): void {
		// console.log(`${gameObject.name} entering rotation state!`)
		gameObject.animationBehaviour?.setAnimation("rotation")
	}

	update(gameObject: GameObject, deltaTime: number): void {}

	exit(gameObject: GameObject): void {}
}
