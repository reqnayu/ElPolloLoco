export class Resource {
	private currentAmount
	private maxAmount

	constructor({ maxAmount, currentAmount = maxAmount }: resourceParams) {
		this.maxAmount = maxAmount
		this.currentAmount = currentAmount
	}

	use(amount: number, emptyUseCallback?: () => void): boolean {
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

type resourceParams = {
	maxAmount: number
	currentAmount?: number
}
