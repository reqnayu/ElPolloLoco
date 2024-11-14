import { MESSAGER } from "../../script.js"

export class TriggerManager {
	allTriggers: trigger[] = []

	constructor() {
		MESSAGER.elements.set("triggerManager", this)
	}

	check(): void {
		// console.log("checking all", this.allTriggers)
		this.allTriggers.forEach(({ name, conditionCallback, triggerCallback }) => {
			if (!name) return
			if (conditionCallback() === true) {
				triggerCallback()
				this.allTriggers.toFiltered(({ name: _name }) => name !== _name)
			}
		})
	}
}

export type trigger = {
	name: string
	conditionCallback: () => boolean
	triggerCallback: () => void
}
