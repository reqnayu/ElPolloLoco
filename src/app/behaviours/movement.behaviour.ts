import { MovementParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../modules/gameObjects/gameObject.object.js"
import { Vector } from "../modules/vector.module.js"

export class MovementBehaviour implements Updateable {
	private gameObject!: GameObject
	speed: Vector
	currentVelocity = new Vector(0, 0)
	constructor({ walkSpeed, jumpStrength }: MovementParams) {
		this.speed = new Vector(walkSpeed, jumpStrength)
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`movementBehaviour added to '${gameObject.name}'`)
		return this
	}

	update(deltaTime: number): void {
		// this.currentVelocity
		// this.gameObject.velocity.setToVector(this.currentVelocity)
		// const positionChange = this.gameObject.velocity.scale(deltaTime)
		this.gameObject.position.add(this.currentVelocity.scale(deltaTime))
	}

	startWalking(): void {
		this.currentVelocity.x = this.gameObject.direction * this.speed.x
	}

	stopWalking(): void {}

	jump(): void {
		this.currentVelocity.y = this.speed.y
	}
}
