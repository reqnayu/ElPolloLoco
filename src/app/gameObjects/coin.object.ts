import { AnimationSet, CoinAnimationState, coinParams } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Timer from "../modules/timer.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"

@Util.Assets({
	img: [...GameObject.getSingleAnimation("8_coin/1_idle", 1, 7)],
	audio: ["coin/Collect.mp3"]
})
export default class Coin extends GameObject {
	private startFrame
	constructor({ spawnPosition, startFrame }: coinParams) {
		super("coin")
		this.startFrame = startFrame
		this.dimensions.set(300, 301).scale(0.3)
		this.position.set(spawnPosition)
		this.initialize()
	}

	protected override initialize(): void {
		this.setBehaviours()
		super.initialize("8_coin/1_idle/I-1.png")
		this.animationBehaviour!.setAnimation("idle", true, this.startFrame)
	}

	protected override setBehaviours(): void {
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
			idle: GameObject.getImages(GameObject.getSingleAnimation("8_coin/1_idle", 1, 7))
		}
	}

	public override collisionCallback(target: GameObject): void {
		// console.log("coin collected!")
		switch (target.name) {
			case "player":
				this.collect(target)
		}
	}

	private collect(player: GameObject): void {
		if (player.resourceBehaviour!.coins?.fraction === 1) return
		this.soundBehaviour?.playOnce("Collect")
		this.collisionBehaviour?.targets.remove("player")
		this.movementBehaviour?.jump()
		new Timer(() => this.delete(), 300).resume()
	}
}
