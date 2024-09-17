import { HealthParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class HealthBehaviour implements Updateable {
	private gameObject!: GameObject
	private hitPoints: number

	constructor({ maximum }: HealthParams) {
		this.hitPoints = maximum
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		// console.log(`HealthBehaviour attached to ${gameObject.name}`)
		return this
	}

	update(deltaTime: number): void {
		if (this.hitPoints === 0) this.die()
	}

	recieveDamage(dmg: number): void {
		this.hitPoints = Math.max(this.hitPoints - dmg, 0)
		if (this.hitPoints === 0) return
		this.gameObject.setState("hurt")
	}

	private die(): void {
		this.gameObject.setState("dead")
	}
}
