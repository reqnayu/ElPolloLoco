import { AnimationSet, PlayerAnimationState } from "../.types/animation.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Vector } from "../modules/vector.module.js"
import { GameObject, getImages, getSingleAnimation } from "./gameObject.object.js"
import { SoundAsset } from "../modules/sound_asset.module.js"
import { Assets } from "../managers/asset_manager.module.js"
import { Bottle } from "./bottle.object.js"
import { MESSAGER } from "../../script.js"

@Assets({
	img: [
		...getSingleAnimation("2_character_pepe/1_idle/idle", 1, 10),
		...getSingleAnimation("2_character_pepe/1_idle/idle_long", 11, 20),
		...getSingleAnimation("2_character_pepe/2_walk", 21, 26),
		...getSingleAnimation("2_character_pepe/3_jump", 31, 39),
		...getSingleAnimation("2_character_pepe/4_hurt", 41, 43),
		...getSingleAnimation("2_character_pepe/5_dead", 51, 57)
	],
	audio: ["player/Jump.mp3", "player/Landing.mp3", "player/Walk.mp3", "player/Snore.mp3"]
})
export class Player extends GameObject {
	protected walkSpeed = 0.4
	private jumpStrength = 1
	private throwables = 5
	private healthPotions = 3

	protected defaultState: keyof stateMap = "idle"

	focusOffset = 400
	states: (keyof stateMap)[] = ["idle", "walk", "jump", "hurt", "dead"]

	protected getFocus(): Vector {
		return this.getCenterPoint().plus(new Vector(this.focusOffset * this.direction, 0))
	}

	constructor() {
		super("player")
		this.dimensions.set(610, 1200).toScaled(0.4)
		this.position.set(0, 100)
		this.initialize()
	}

	protected initialize(): void {
		this.setBehaviours()
		super.initialize("2_character_pepe/1_idle/idle/I-1.png")
		// this.setState()
	}

	protected setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		const { walkSpeed, jumpStrength, throwables, healthPotions } = this

		this.image = animationSet.idle[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
		this.drawBehaviour = BehaviourFactory.create("draw", { isScaled: true }).onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", {
			walkSpeed,
			jumpStrength,
			clampToWorld: true
		}).onAttach(this)
		this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this)
		this.soundBehaviour = BehaviourFactory.create("sound", {
			soundType: this.name,
			assets: ["sfx/Jump.mp3", "sfx/Landing.mp3", "sfx/Walk.mp3", "sfx/Snore.mp3"]
		})
		this.collisionBehaviour = BehaviourFactory.create("collision", {
			targets: ["enemy", "endboss", "coin", "bottle"],
			offsets: [200, 60, 20, 45],
			cooldown: 1000
		}).onAttach(this)
		this.resourceBehaviour = BehaviourFactory.create("resource", { healthPoints: 200, bottles: 5 }).onAttach(this)
	}

	protected getAnimationSet(): Pick<AnimationSet, PlayerAnimationState> {
		return {
			idle: getImages(getSingleAnimation("2_character_pepe/1_idle/idle", 1, 10)),
			idle_long: getImages(getSingleAnimation("2_character_pepe/1_idle/idle_long", 11, 20)),
			walk: getImages(getSingleAnimation("2_character_pepe/2_walk", 21, 26)),
			jump: getImages(getSingleAnimation("2_character_pepe/3_jump", 31, 39)),
			hurt: getImages(getSingleAnimation("2_character_pepe/4_hurt", 41, 43)),
			dead: getImages(getSingleAnimation("2_character_pepe/5_dead", 51, 57))
		}
	}

	throwBottle(): void {
		if (!this.resourceBehaviour?.use("bottles", 1)) return
		const spawnPosition = this.position
		new Bottle({ position: spawnPosition, velocity: this.movementBehaviour!.velocity, direction: this.direction })
	}

	collisionCallback(target: GameObject): void {
		console.log(`player collided with ${target.name}`)
		switch (target.name) {
			case "coin":
				return this.resourceBehaviour?.add("coins", 1)
			case "bottle":
				return this.resourceBehaviour?.add("bottles", 1)
		}
		// this.resourceBehaviour?.receiveDamage(80)
	}

	private collectBottle(): void {}

	// canMove(): boolean {
	// 	return this.input.isMovingLeft || this.input.isMovingRight
	// }

	// canJump(): boolean {
	// 	return this.input.isJumping && !this.gravityBehavior?.canFall()
	// }
}
