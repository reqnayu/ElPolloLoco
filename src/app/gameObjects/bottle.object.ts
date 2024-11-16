import { AnimationSet, BottleAnimationState } from "../.types/animation.type.js"
import { GameObjectParams } from "../.types/gameObject.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { AssetManager, Assets } from "../managers/asset.manager.js"
import { Main } from "../modules/main.module.js"
import { Timer } from "../modules/timer.module.js"
import { Vector } from "../modules/vector.module.js"
import { GameObject } from "./gameObject.object.js"

@Assets({
	img: [
		"6_salsa_bottle/salsa_bottle.png",
		"6_salsa_bottle/bottle_rotation/1_bottle_rotation.png",
		"6_salsa_bottle/bottle_rotation/2_bottle_rotation.png",
		"6_salsa_bottle/bottle_rotation/3_bottle_rotation.png",
		"6_salsa_bottle/bottle_rotation/4_bottle_rotation.png",
		"6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png",
		"6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png",
		"6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png",
		"6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png",
		"6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png",
		"6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png",
		"6_salsa_bottle/2_salsa_bottle_on_ground.png"
	],
	audio: ["bottle/Splash.mp3", "bottle/Throw_1.mp3", "bottle/Throw_2.mp3"]
})
export class Bottle extends GameObject {
	states: (keyof stateMap)[] = ["rotation"]
	protected defaultState: keyof stateMap = "rotation"
	private startingVelocity = Vector.zero

	constructor({ position, velocity, direction }: GameObjectParams["bottle"]) {
		super("bottle")
		this.dimensions.set(400, 400).toScaled(0.5)
		this.position.set(position)
		// this.startingVelocity.add(velocity)
		this.direction = direction
		this.initialize()
		this.soundBehaviour!.playRandom(["Throw_1", "Throw_2"])
	}

	protected initialize(): void {
		// console.log("background created!")
		this.setBehaviours()
		super.initialize("6_salsa_bottle/salsa_bottle.png")
		this.setState()
	}

	protected setBehaviours(): void {
		const animationSet: Pick<AnimationSet, BottleAnimationState> = {
			rotation: [
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/1_bottle_rotation.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/2_bottle_rotation.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/3_bottle_rotation.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/4_bottle_rotation.png")
			],
			splash: [
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png"),
				AssetManager.getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png")
			],
			idle: [AssetManager.getAsset<"img">("6_salsa_bottle/2_salsa_bottle_on_ground.png")]
		}
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: 1, jumpStrength: 0.8 }).onAttach(this)
		this.movementBehaviour.velocity.add(this.startingVelocity)
		this.movementBehaviour.input.isMovingLeft = this.direction === -1
		this.movementBehaviour.input.isMovingRight = this.direction === 1
		this.movementBehaviour.jump()
		this.gravityBehavior = BehaviourFactory.create("gravity", { landCallback: () => this.land() }).onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", {
			targets: ["enemy", "endboss"],
			offsets: [30, 30, 30, 30],
			damage: 100
		}).onAttach(this)
		this.soundBehaviour = BehaviourFactory.create("sound", {
			soundType: "bottle",
			assets: ["sfx/Splash.mp3", "sfx/Throw_1.mp3", "sfx/Throw_2.mp3"]
		})
	}

	collisionCallback(target: GameObject): void {
		switch (target.name) {
			case "enemy":
			case "endboss":
				return this.hitEnemy(target)
			case "player":
				this.collect()
		}
	}

	private hitEnemy(target: GameObject): void {
		this.gravityBehavior = undefined
		this.movementBehaviour = undefined
		this.collisionBehaviour = undefined
		this.soundBehaviour?.playOnce("Splash")
		this.animationBehaviour?.setAnimation("splash", false, () =>
			Main.removeObject(this.id)
		)
	}

	private land(): void {
		this.movementBehaviour!.input.isMovingLeft = false
		this.movementBehaviour!.input.isMovingRight = false
		this.animationBehaviour?.setAnimation("idle")
		this.collisionBehaviour!.targets = ["player"]
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
