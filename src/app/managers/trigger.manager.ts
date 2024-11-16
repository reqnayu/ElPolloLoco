export abstract class TriggerManager {
	private static allTriggers: trigger[] = []

	public static check(): void {
		// console.log("checking all", this.allTriggers)
		this.allTriggers.forEach(({ name, conditionCallback, triggerCallback }) => {
			if (!name) return
			if (conditionCallback() === true) {
				triggerCallback()
				this.allTriggers.toFiltered(({ name: _name }) => name !== _name)
			}
		})
	}
	
	public static addTrigger(tr: trigger): void {
		this.allTriggers.push(tr)
	}
}

export type trigger = {
	name: string
	conditionCallback: () => boolean
	triggerCallback: () => void
}
