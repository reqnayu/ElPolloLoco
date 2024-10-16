import { MESSAGER } from "../../script.js"

export class Resource {
	protected gui
	protected currentAmount
	protected maxAmount

	constructor({ maxAmount, currentAmount = maxAmount }: resourceParams) {
		this.gui = MESSAGER.dispatch("main").gui
		console.log(this.gui)
		this.maxAmount = maxAmount
		this.currentAmount = currentAmount
	}

	use(amount: number, emptyUseCallback?: () => void): boolean {
		return true
		if (this.currentAmount === 0) {
			emptyUseCallback?.()
			return false
		}
		this.currentAmount = Math.max(0, this.currentAmount - amount)
		return true
	}

	add(amount: number): void {
		this.currentAmount = Math.min(this.maxAmount, this.currentAmount + amount)
	}

	emptyUse(): void {}
}

export type resourceParams = {
	maxAmount: number
	currentAmount?: number
}
