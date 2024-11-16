import { movementBehaviourInputMap, movementParams } from "../.types/types.js"
import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Main from "../modules/main.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"

export default class MovementBehaviour implements Updateable {
	gameObject!: GameObject
	private maxSpeed: Vector
	public velocity = Vector.zero
	private clampToWorld
	public input: movementBehaviourInputMap = {
		isMovingRight: false,
		isMovingLeft: false,
		isJumping: false
	}

	constructor({ walkSpeed, jumpStrength, clampToWorld = false }: movementParams) {
		this.maxSpeed = new Vector(walkSpeed, jumpStrength || 0)
		this.clampToWorld = clampToWorld
	}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`movementBehaviour added to '${gameObject.name}'`)
		return this
	}

	public update(deltaTime: number): void {
		this.move()
		if (deltaTime === 0) return
		const newPosition = this.gameObject.position.plus(this.velocity.scale(deltaTime))
		const x = this.clampToWorld
			? Util.clamp(newPosition.x, 0, Main.maxPosX - this.gameObject.Dimensions.x)
			: newPosition.x
		const y = newPosition.y
		// console.log(`dt: ${deltaTime}, y: ${y}`)
		this.gameObject.position.set(x, y)
	}

	public startWalking(): void {
		// console.log(`${this.gameObject.name} started walking!`)
		this.velocity.x = this.gameObject.direction * this.maxSpeed.x
	}

	public stopWalking(): void {
		// console.log(`${this.gameObject.name} stopped walking!`)
		this.velocity.x = 0
	}

	public jump(): void {
		// console.log("jump!")
		this.velocity.y = this.maxSpeed.y
	}

	public move(): void {
		const canMove = this.canMove()
		const isStationary = this.velocity.x === 0
		const { isMovingLeft, isMovingRight } = this.input
		if (Util.xOr(isMovingLeft, isMovingRight)) {
			if (isMovingRight) this.gameObject.direction = 1
			else if (isMovingLeft) this.gameObject.direction = -1
			this.startWalking()
		} else if (!canMove && !isStationary) this.stopWalking()
	}

	public canMove(): boolean {
		return this.input.isMovingLeft || this.input.isMovingRight
	}

	public canJump(): boolean {
		return this.input.isJumping || false
	}

	public stopMoving(): void {
		this.input.isMovingLeft = false
		this.input.isMovingRight = false
	}
}
