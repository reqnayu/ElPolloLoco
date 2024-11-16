import { Gui } from "./gui.module.js"
import { Resource } from "./resource.module.js"

export class CoinResource extends Resource {
	add(amount: number): void {
		super.add(amount)
		Gui.updateStatusBar("coin", this.currentAmount, this.maxAmount)
	}
}
