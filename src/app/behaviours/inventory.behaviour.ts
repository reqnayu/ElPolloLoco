import { InventoryParams } from "../.types/behaviour.type.js"
import { Updateable } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"

export class InventoryBehaviour implements Updateable {
	private throwables = 0
	private healthPotions = 0
	constructor({ throwables, healthPotions }: InventoryParams) {
		if (throwables) this.throwables = throwables
		if (healthPotions) this.healthPotions = healthPotions
	}

	onAttach(gameObject: GameObject): this {
		return this
	}

	update(deltaTime: number): void {}

	use(item: keyof InventoryParams): void {
		if (this[item] === 0) return console.log(`no ${item} left!`)
	}
}
