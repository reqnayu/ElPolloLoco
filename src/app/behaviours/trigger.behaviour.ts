import { trigger } from "../.types/types.js"
import { Behaviour } from "../.types/interfaces.js"
import GameObject from "../gameObjects/gameObject.object.js"
import TriggerManager from "../managers/trigger.manager.js"

export default class TriggerBehaviour implements Behaviour {
	gameObject!: GameObject

	constructor(private triggers: trigger[]) {
		this.triggers.forEach((trigger) => TriggerManager.addTrigger(trigger))
	}

	public onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}
}
