import { MESSAGER } from "../../script.js"
import { Resource } from "./resource.module.js"

export class CoinResource extends Resource {
	add(amount: number): void {
		super.add(amount)
		MESSAGER.dispatch("gui").updateStatusBar("coin", this.currentAmount, this.maxAmount)
	}
}
