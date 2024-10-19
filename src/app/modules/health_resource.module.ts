import { Resource } from "./resource.module.js"

export class HealthResource extends Resource {
	use(dmg: number): boolean {
		const hasHealth = super.use(dmg)
		if (!hasHealth) return false
		// console.log(`${dmg} health lost!`)
		return true
	}
}
