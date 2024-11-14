import { MESSAGER } from "../../script.js"
import { Behaviour } from "../.types/behaviours.interface.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { trigger } from "../managers/trigger_manager.module.js"

export class TriggerBehaviour implements Behaviour {
	gameObject!: GameObject
	constructor(private triggers: trigger[]) {
		const triggerManager = MESSAGER.dispatch("triggerManager")
		this.triggers.forEach((trigger) => triggerManager.allTriggers.push(trigger))
	}
	onAttach(gameObject: GameObject): this {
		this.gameObject = gameObject
		return this
	}
}
