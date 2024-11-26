import Gui from "./gui.module.js"
import Resource from "./resource.module.js"

export class BottleResource extends Resource {
	public override use(): boolean {
		const isSuccessful = super.use(1)
		if (!isSuccessful) return false
		Gui.updateStatusBar("bottle", this.currentAmount, this.maxAmount)
		// console.log("using bottle")
		return true
	}

	public override add(): void {
		// console.log("picking up bottle!")
		super.add(1)
		Gui.updateStatusBar("bottle", this.currentAmount, this.maxAmount)
	}

	public override emptyUse(): void {
		Gui.statusBarError("bottle")
	}
}
