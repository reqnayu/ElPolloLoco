import { MESSAGER } from "../../script.js"
import { MovementParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Vector } from "../modules/vector.module.js"
import { clamp } from "../util/general.util.js"

export class MovementBehaviour implements Updateable {
	private gameObject!: GameObject
	speed: Vector
	currentVelocity = new Vector(0, 0)
	private maxPosX

	constructor({ walkSpeed, jumpStrength }: MovementParams) {
		this.speed = new Vector(walkSpeed, jumpStrength || 0)
		this.maxPosX = MESSAGER.dispatch("main").maxPosX
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`movementBehaviour added to '${gameObject.name}'`)
		return this
	}

	update(deltaTime: number): void {
		const newPosition = this.gameObject.position.plus(this.currentVelocity.scale(deltaTime))
		const x = clamp(newPosition.x, 0, this.maxPosX - this.gameObject.dimensions.x)
		const y = newPosition.y
		this.gameObject.position.set(x, y)
	}

	startWalking(): void {
		this.currentVelocity.x = this.gameObject.direction * this.speed.x
	}

	stopWalking(): void {
		this.currentVelocity.x = 0
	}

	jump(): void {
		this.currentVelocity.y = this.speed.y
	}
}
