import { Resource } from "./resource.module.js"

export class BottleResource extends Resource {
	use(): boolean {
		const isSuccessful = super.use(1, () => {
			console.log("no bottles left!")
		})
		if (!isSuccessful) return false
		console.log("using bottle")
		return true
	}

	add(): void {
		console.log("picking up bottle!")
		super.add(1)
	}
}
