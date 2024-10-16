import { MESSAGER } from "../../script.js"
import { AnimationSet, BottleAnimationState } from "../.types/animation.type.js"
import { BottleParams } from "../.types/gameObject.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets, getAsset } from "../managers/asset_manager.module.js"
import { SoundAsset } from "../modules/sound_asset.module.js"
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
		"6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png"
	],
	audio: ["bottle/Splash.mp3"]
})
export class Bottle extends GameObject {
	states: (keyof stateMap)[] = ["rotation"]
	protected defaultState: keyof stateMap = "rotation"
	private startingVelocity = new Vector(0, 0)
	isFriendly: boolean = true

	constructor({ position, velocity, direction }: BottleParams) {
		super("bottle")
		this.dimensions.set(400, 400).toScaled(0.5)
		this.position.setToVector(position)
		this.startingVelocity.add(velocity)
		this.direction = direction
		this.initialize()
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
				getAsset<"img">("6_salsa_bottle/bottle_rotation/1_bottle_rotation.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/2_bottle_rotation.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/3_bottle_rotation.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/4_bottle_rotation.png")
			],
			splash: [
				getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png"),
				getAsset<"img">("6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png")
			]
		}
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", { walkSpeed: 1, jumpStrength: 0.8 }).onAttach(this)
		this.movementBehaviour.velocity.add(this.startingVelocity)
		this.movementBehaviour.input.isMovingLeft = this.direction === -1
		this.movementBehaviour.input.isMovingRight = this.direction === 1
		this.movementBehaviour.jump()
		this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", { offsets: [30, 30, 30, 30] }).onAttach(this)
		this.soundBehaviour = BehaviourFactory.create("sound", [new SoundAsset("sfx", "bottle/Splash.mp3")])
	}

	collisionCallback(target: GameObject): void {
		this.gravityBehavior = undefined
		this.movementBehaviour = undefined
		this.collisionBehaviour = undefined
		this.soundBehaviour?.playOnce("Splash")
		this.animationBehaviour?.setAnimation("splash", false, () =>
			MESSAGER.dispatch("main").allObjects.delete(this.id)
		)
	}
}
