import { resourceParams } from "../.types/types.js"

export default abstract class Resource {
	currentAmount
	maxAmount

	public get fraction(): number {
		return this.currentAmount > 0 ? this.currentAmount / this.maxAmount : 0
	}

	constructor({ maxAmount, currentAmount = maxAmount }: resourceParams) {
		this.maxAmount = maxAmount
		this.currentAmount = currentAmount
	}

	public use(amount: number, emptyUseCallback?: () => void): boolean {
		if (this.currentAmount === 0) {
			emptyUseCallback?.()
			return false
		}
		this.currentAmount = Math.max(0, this.currentAmount - amount)
		return true
	}

	public add(amount: number): void {
		this.currentAmount = Math.min(this.maxAmount, this.currentAmount + amount)
	}

	public emptyUse(): void {}
}
