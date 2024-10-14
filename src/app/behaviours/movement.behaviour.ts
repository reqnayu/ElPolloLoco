import { MESSAGER } from "../../script.js"
import { MovementParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Vector } from "../modules/vector.module.js"
import { clamp } from "../util/general.util.js"

export class MovementBehaviour implements Updateable {
	private gameObject!: GameObject
	speed: Vector
	velocity = new Vector(0, 0)
	private maxPosX

	constructor({ walkSpeed, jumpStrength, clampToWorld = false }: MovementParams) {
		this.speed = new Vector(walkSpeed, jumpStrength || 0)
		this.maxPosX = MESSAGER.dispatch("main").maxPosX
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`movementBehaviour added to '${gameObject.name}'`)
		return this
	}

	update(deltaTime: number): void {
		this.velocity.x = this.speed.x * this.gameObject.direction
		if (deltaTime === 0) return
		const newPosition = this.gameObject.position.plus(this.velocity.scale(deltaTime))
		// const x = clamp(newPosition.x, 0, this.maxPosX - this.gameObject.dimensions.x)
		const x = newPosition.x
		const y = newPosition.y
		// console.log(`dt: ${deltaTime}, y: ${y}`)
		this.gameObject.position.set(x, y)
	}

	private startWalking(): void {
		this.velocity.x = this.gameObject.direction * this.speed.x
	}

	private stopWalking(): void {
		this.velocity.x = 0
	}

	jump(): void {
		// console.log("jump!")
		this.velocity.y = this.speed.y
	}

	move(): void {
		if (!this.gameObject.canMove()) return
		// const direction = this.gameObject.input.isMovingRight ? 1 : this.gameObject.input.isMovingLeft ? -1 : 0
		// if (direction) {
		// 	this.gameObject.direction = direction
		// 	this.startWalking()
		// } else {
		// 	this.stopWalking()
		// }
	}
}
