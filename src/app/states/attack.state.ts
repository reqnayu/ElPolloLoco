import { State, stateMap } from "../.types/types.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class AttackState implements State {
	public type: keyof stateMap = "attack"

	public enter(gameObject: GameObject): void {
		gameObject.animationBehaviour?.setAnimation(this.type, () => {
			gameObject.setState("alert")
		})
	}

	public update(gameObject: GameObject, deltaTime: number): void {}

	public exit(gameObject: GameObject): void {}
}
