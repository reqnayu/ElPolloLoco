import Gui from "./gui.module.js"
import Resource from "./resource.module.js"

export class CoinResource extends Resource {
	public override add(amount: number): void {
		super.add(amount)
		Gui.updateStatusBar("coin", this.currentAmount, this.maxAmount)
	}

	public override use(amount: number): boolean {
		if (super.use(amount) === false) return false
		Gui.updateStatusBar("coin", this.currentAmount, this.maxAmount)
		return true
	}

	public override emptyUse(): void {
		Gui.statusBarError("coin")
	}
}
