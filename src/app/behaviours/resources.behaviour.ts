import { resourceParams } from "../.types/behaviour.type.js"
import { BottleResource } from "../modules/bottle_resource.module.js"
import { CoinResource } from "../modules/coin_resource.module.js"
import { HealthResource } from "../modules/health_resource.module.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class ResourceBehaviour implements Updateable {
	gameObject!: GameObject
	private healthPoints
	private bottles?
	private coins?
	constructor({ healthPoints, bottles, coins }: resourceParams) {
		this.healthPoints = new HealthResource({ maxAmount: healthPoints })
		if (bottles) this.bottles = new BottleResource({ maxAmount: bottles })
		if (coins) this.coins = new CoinResource({ maxAmount: coins, currentAmount: 0 })
	}

	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}

	update(deltaTime: number): void {}

	use(type: keyof resourceParams, amount: number): boolean {
		return this[type]?.use(amount) || false
	}

	receiveDamage(amount: number): void {
		if (this.use("healthPoints", amount)) {
			this.gameObject.setState("hurt")
		} else {
			this.gameObject.setState("dead")
		}
	}
}