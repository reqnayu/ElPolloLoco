import { trigger } from "../.types/types.js"

export default abstract class TriggerManager {
	private static allTriggers: trigger[] = []

	public static check(): void {
		// console.log("checking all", this.allTriggers)
		this.allTriggers.forEach((trigger) => {
			if (trigger.condition() === true) {
				trigger.callback()
				this.allTriggers.remove(trigger)
			}
		})
	}

	public static addTrigger(tr: trigger): void {
		this.allTriggers.push(tr)
	}
}
