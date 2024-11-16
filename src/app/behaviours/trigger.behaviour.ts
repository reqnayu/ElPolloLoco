import { Behaviour } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { trigger, TriggerManager } from "../managers/trigger.manager.js"

export class TriggerBehaviour implements Behaviour {
	gameObject!: GameObject
	constructor(private triggers: trigger[]) {
		this.triggers.forEach((trigger) => TriggerManager.addTrigger(trigger))
	}
	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}
}
