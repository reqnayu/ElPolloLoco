import { Resource } from "./resource.module.js"

export class BottleResource extends Resource {
	use(): boolean {
		const isSuccessful = super.use(1, () => this.emptyUse())
		if (!isSuccessful) return false
		this.gui.updateStatusBar("bottle", this.currentAmount / this.maxAmount)
		// console.log("using bottle")
		return true
	}

	add(): void {
		console.log("picking up bottle!")
		super.add(1)
	}

	emptyUse(): void {
		this.gui.statusBarError("bottle")
		console.log("no bottles left!")
	}
}
