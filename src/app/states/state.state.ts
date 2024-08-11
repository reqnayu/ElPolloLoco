import { GameObject } from "../modules/gameObjects/gameObject.object.js"

export interface State {
	enter(gameObject: GameObject): void
	update(gameObject: GameObject, deltaTime: number): void
	exit(gameObject: GameObject): void
}
