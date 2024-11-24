import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class AlertState implements State {
	public type: keyof stateMap = "alert"

	public enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation(this.type)
	}

	public update(gameObject: GameObject, deltaTime: number): void {}

	public exit(gameObject: GameObject): void {}
}
