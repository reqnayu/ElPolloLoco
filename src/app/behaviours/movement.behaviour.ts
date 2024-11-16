import { movementParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { Main } from "../modules/main.module.js"
import { Vector } from "../modules/vector.module.js"
import { clamp, xOr } from "../util/general.util.js"

export class MovementBehaviour implements Updateable {
	gameObject!: GameObject
	maxSpeed: Vector
	velocity = Vector.zero
	private clampToWorld
	input: inputMap = {
		isMovingRight: false,
		isMovingLeft: false,
		isJumping: false
	}

	constructor({ walkSpeed, jumpStrength, clampToWorld = false }: movementParams) {
		this.maxSpeed = new Vector(walkSpeed, jumpStrength || 0)
		this.clampToWorld = clampToWorld
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`movementBehaviour added to '${gameObject.name}'`)
		return this
	}

	update(deltaTime: number): void {
		this.move()
		if (deltaTime === 0) return
		const newPosition = this.gameObject.position.plus(this.velocity.scale(deltaTime))
		const x = this.clampToWorld
			? clamp(newPosition.x, 0, Main.maxPosX - this.gameObject.Dimensions.x)
			: newPosition.x
		const y = newPosition.y
		// console.log(`dt: ${deltaTime}, y: ${y}`)
		this.gameObject.position.set(x, y)
	}

	startWalking(): void {
		// console.log(`${this.gameObject.name} started walking!`)
		this.velocity.x = this.gameObject.direction * this.maxSpeed.x
	}

	stopWalking(): void {
		// console.log(`${this.gameObject.name} stopped walking!`)
		this.velocity.x = 0
	}

	jump(): void {
		// console.log("jump!")
		this.velocity.y = this.maxSpeed.y
	}

	move(): void {
		const canMove = this.canMove()
		const isStationary = this.velocity.x === 0
		const { isMovingLeft, isMovingRight } = this.input
		if (xOr(isMovingLeft, isMovingRight)) {
			if (isMovingRight) this.gameObject.direction = 1
			else if (isMovingLeft) this.gameObject.direction = -1
			this.startWalking()
		} else if (!canMove && !isStationary) this.stopWalking()
	}

	canMove(): boolean {
		return this.input.isMovingLeft || this.input.isMovingRight
	}

	canJump(): boolean {
		return this.input.isJumping || false
	}

	stopMoving(): void {
		this.input.isMovingLeft = false
		this.input.isMovingRight = false
	}
}

export type inputMap = {
	isMovingRight: boolean
	isMovingLeft: boolean
	isJumping?: boolean
}
