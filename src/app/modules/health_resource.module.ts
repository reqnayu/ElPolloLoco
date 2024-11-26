import Gui from "./gui.module.js"
import Resource from "./resource.module.js"

export class HealthResource extends Resource {
	public override use(dmg: number): boolean {
		const hasHealth = super.use(dmg)
		if (!hasHealth) return false
		// console.log(`${dmg} health lost!`)
		return true
	}

	public override add(amount: number): void {
		super.add(amount)
		Gui.updateStatusBar("hp", this.currentAmount, this.maxAmount)
	}
}
