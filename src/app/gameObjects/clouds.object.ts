import { GameObject } from "./gameObject.object.js"

export class Clouds extends GameObject {
	constructor() {
		super("Clouds")
		super.initialize("./app/assets/img/5_background/layers/4_clouds/full.png")
	}
}
