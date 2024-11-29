import { resourceParams } from "../.types/types.js"

export default abstract class Resource {
	public currentAmount
	public maxAmount
	protected partialUse = false

	public get fraction(): number {
		return this.currentAmount > 0 ? this.currentAmount / this.maxAmount : 0
	}

	constructor({ maxAmount, currentAmount = maxAmount }: resourceParams) {
		this.maxAmount = maxAmount
		this.currentAmount = currentAmount
	}

	public use(amount: number): boolean {
		if (!this.partialUse && this.currentAmount < amount) {
			this.emptyUse()
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
