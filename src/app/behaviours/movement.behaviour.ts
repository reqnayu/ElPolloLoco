import { movementBehaviourInputMap, movementParams } from "../.types/types.js"
import { Updateable } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Main from "../modules/main.module.js"
import Vector from "../modules/vector.module.js"
import Util from "../util/general.util.js"
import Settings from "../modules/settings.module.js"

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
		return this
	}

	public update(deltaTime: number): void {
		this.move()
		if (deltaTime === 0) return
		const newPosition = this.gameObject.position.plus(this.velocity.scale(deltaTime))
		const x = this.clampToWorld
			? Util.clamp(newPosition.x, 0, Settings.maxPosX - this.gameObject.Dimensions.x)
			: newPosition.x
		const y = newPosition.y
		this.gameObject.position.set(x, y)
	}

	private startWalking(): void {
		this.velocity.x = this.gameObject.direction * this.maxSpeed.x
	}

	private stopWalking(): void {
		this.velocity.x = 0
	}

	public jump(): void {
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
