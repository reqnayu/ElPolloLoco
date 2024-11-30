import { Updateable } from "../.types/interfaces.js"
import { gravityParams } from "../.types/types.js"
import Vector from "../modules/vector.module.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Settings from "../modules/settings.module.js"

export default class GravityBehaviour implements Updateable {
	gameObject!: GameObject
	private gravity = new Vector(0, -0.002)
	canFallThroughFloor = false
	private landCallback

	constructor({ landCallback }: gravityParams = {}) {
		this.landCallback = landCallback
	}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}

	public update(deltaTime: number): void {
		if (this.shouldLand()) return this.land()
		if (!this.canFall()) return
		this.fall(deltaTime)
	}

	public canFall(): boolean {
		return this.gameObject.position.y > Settings.floorHeight
	}

	private shouldLand(): boolean {
		if (this.canFallThroughFloor === true) return false
		const vy = this.gameObject.movementBehaviour!.velocity.y
		const posY = this.gameObject.position.y
		return vy < 0 && posY <= Settings.floorHeight
	}

	private fall(deltaTime: number): void {
		this.gameObject.movementBehaviour!.velocity.y += this.gravity.scale(deltaTime).y
	}

	private land(): void {
		if (this.gameObject.state?.type === "jump") this.gameObject.setState("idle")
		this.gameObject.movementBehaviour!.velocity.y = 0
		this.gameObject.position.y = Settings.floorHeight
		this.landCallback?.()
	}
}
