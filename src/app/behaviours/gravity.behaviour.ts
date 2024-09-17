import { Vector } from "../modules/vector.module.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class GravityBehaviour implements Updateable {
	private gameObject!: GameObject
	private gravity = new Vector(0, -6)
	private floorHeight = 85

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		this.gameObject.position.y = this.floorHeight
		// console.log(`gravity behaviour added to '${gameObject.name}'!`)
		return this
	}

	update(deltaTime: number): void {
		const velocity = this.gameObject.movementBehaviour!.currentVelocity
		velocity.y = this.canFall() ? velocity.y + this.gravity.y * deltaTime : 0
	}

	canFall(): boolean {
		return this.gameObject.position.y > this.floorHeight
	}
}
