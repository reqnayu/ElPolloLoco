import { MESSAGER } from "../../script.js"
import { healthParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class HealthBehaviour implements Updateable {
	private gameObject!: GameObject
	private maxHp: number
	private hitPoints: number

	constructor({ maximum }: healthParams) {
		this.maxHp = maximum
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
		if (this.gameObject.name === "player")
			MESSAGER.dispatch("main").gui.updateStatusBar("hp", (this.hitPoints / this.maxHp) * 100)
		if (this.hitPoints === 0) return this.die()
		this.gameObject.setState("hurt")
	}

	private die(): void {
		this.gameObject.setState("dead")
		this.gameObject.collisionBehaviour = undefined
		if (this.gameObject.name === "player") MESSAGER.dispatch("input").isBlocked = true
	}
}
