import { GameObject } from "../modules/gameObjects/gameObject.object.js"
import { Vector } from "../modules/vector.module.js"
import { Updateable } from "../.types/behaviours.interface.js"

export class GravityBehaviour implements Updateable {
	private gameObject!: GameObject
	private gravity = new Vector(0, -4)

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`gravity behaviour added to '${gameObject.name}'!`)
		return this
	}

	update(deltaTime: number): void {
		const velocity = this.gameObject.movementBehaviour!.currentVelocity
		velocity.y = this.gameObject.canFall() ? velocity.y + this.gravity.y * deltaTime : 0
	}
}
