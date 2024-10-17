import { AnimationSet, AnimationState, CoinAnimationState } from "../.types/animation.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { SoundAsset } from "../modules/sound_asset.module.js"
import { Timer } from "../modules/timer.module.js"
import { GameObject, getImages, getSingleAnimation } from "./gameObject.object.js"

@Assets({
	img: [...getSingleAnimation("8_coin/1_idle", 1, 7)],
	audio: ["coin/Collect.mp3"]
})
export class Coin extends GameObject {
	constructor() {
		super("coin")
		this.dimensions.set(300, 301).scale(0.3)
		this.position.set(300, 0)
		this.initialize()
	}

	protected initialize(): void {
		// this.image = getAsset<"img">("8_coin/1_idle/I-1.png")
		this.setBehaviours()
		super.initialize("8_coin/1_idle/I-1.png")
		this.animationBehaviour?.setAnimation("idle", true, undefined, true)
	}

	protected setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		this.image = animationSet.idle[0]
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: 0, jumpStrength: 0.8 }).onAttach(this)
		this.animationBehaviour = BehaviourFactory.create("animation", {
			animationSet: this.getAnimationSet()
		}).onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", {
			targets: ["player"],
			offsets: [100, 100, 100, 100]
		}).onAttach(this)
		this.soundBehaviour = BehaviourFactory.create("sound", { soundType: this.name, assets: ["sfx/Collect.mp3"] })
	}

	protected getAnimationSet(): Pick<AnimationSet, CoinAnimationState> {
		return {
			idle: getImages(getSingleAnimation("8_coin/1_idle", 1, 7))
		}
	}

	collisionCallback(target: GameObject): void {
		console.log("coin collected!")
		switch (target.name) {
			case "player":
				this.collect()
		}
	}

	private collect(): void {
		this.soundBehaviour?.playOnce("Collect")
		this.collisionBehaviour?.targets.remove("player")
		this.movementBehaviour?.jump()
		new Timer({
			handler: () => this.delete(),
			timeout: 300
		}).resume()
	}
}
