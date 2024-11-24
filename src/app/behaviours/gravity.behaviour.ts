import { Updateable } from "../.types/interfaces.js"
import { gravityParams } from "../.types/types.js"
import Vector from "../modules/vector.module.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class GravityBehaviour implements Updateable {
	gameObject!: GameObject
	private gravity = new Vector(0, -0.002)
	floorHeight = 85
	canFallThroughFloor = false
	private landCallback

	constructor({ landCallback }: gravityParams = {}) {
		this.landCallback = landCallback
	}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// this.gameObject.position.y = this.floorHeight
		// console.log(`gravity behaviour added to '${gameObject.name}'!`)
		return this
	}

	public update(deltaTime: number): void {
		if (this.shouldLand()) return this.land()
		if (!this.canFall()) return
		this.fall(deltaTime)
	}

	public canFall(): boolean {
		return this.gameObject.position.y > this.floorHeight
	}

	private shouldLand(): boolean {
		if (this.canFallThroughFloor === true) return false
		const vy = this.gameObject.movementBehaviour!.velocity.y
		const posY = this.gameObject.position.y
		// console.log(`vy: ${vy}, posY: ${posY}`)
		return vy < 0 && posY <= this.floorHeight
	}

	private fall(deltaTime: number): void {
		this.gameObject.movementBehaviour!.velocity.y += this.gravity.scale(deltaTime).y
	}

	private land(): void {
		if (this.gameObject.state?.type === "jump") this.gameObject.setState("idle")
		this.gameObject.movementBehaviour!.velocity.y = 0
		this.gameObject.position.y = this.floorHeight
		this.landCallback?.()
	}
}
