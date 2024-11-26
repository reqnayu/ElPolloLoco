import { resourceAmountParams } from "../.types/types.js"
import { Updateable } from "../.types/interfaces.js"
import { BottleResource } from "../modules/bottle_resource.module.js"
import { CoinResource } from "../modules/coin_resource.module.js"
import { HealthResource } from "../modules/health_resource.module.js"
import GameObject from "../gameObjects/gameObject.object.js"

export default class ResourceBehaviour implements Updateable {
	gameObject!: GameObject
	public healthPoints
	public bottles?
	public coins?

	constructor({ healthPoints, bottles, coins }: resourceAmountParams) {
		this.healthPoints = new HealthResource({ maxAmount: healthPoints })
		if (bottles) this.bottles = new BottleResource({ maxAmount: bottles })
		if (coins) this.coins = new CoinResource({ maxAmount: coins, currentAmount: 0 })
	}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}

	public update(deltaTime: number): void {}

	public use(type: keyof resourceAmountParams, amount: number): boolean {
		return this[type]?.use(amount) || false
	}

	public add(type: keyof resourceAmountParams, amount: number): void {
		return this[type]?.add(amount)
	}

	public receiveDamage(amount: number): void {
		this.use("healthPoints", amount)
	}
}
