import { AnimationSet, PlayerAnimationState, stateMap } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Vector from "../modules/vector.module.js"
import Bottle from "./bottle.object.js"
import Timer from "../modules/timer.module.js"
import Settings from "../modules/settings.module.js"
import Input from "../modules/input.module.js"
import Gui from "../modules/gui.module.js"
import Main from "../modules/main.module.js"
import Camera from "../modules/camera.module.js"
import Util from "../util/general.util.js"
import GameObject from "./gameObject.object.js"

@Util.Assets({
	img: [
		...GameObject.getSingleAnimation("2_character_pepe/1_idle/idle", 1, 10),
		...GameObject.getSingleAnimation("2_character_pepe/1_idle/idle_long", 11, 20),
		...GameObject.getSingleAnimation("2_character_pepe/2_walk", 21, 26),
		...GameObject.getSingleAnimation("2_character_pepe/3_jump", 31, 39),
		...GameObject.getSingleAnimation("2_character_pepe/4_hurt", 41, 43),
		...GameObject.getSingleAnimation("2_character_pepe/5_dead", 51, 57)
	],
	audio: [
		"player/Jump.mp3",
		"player/Landing.mp3",
		"player/Walk.mp3",
		"player/Snore.mp3",
		"player/Death.mp3",
		"player/Hurt_1.mp3",
		"player/Hurt_2.mp3",
		"player/Hurt_3.mp3"
	]
})
export default class Player extends GameObject {
	protected walkSpeed = 0.6
	// protected walkSpeed: number = 1
	private jumpStrength = 1

	protected defaultState: keyof stateMap = "idle"

	focusOffset = 400
	states: (keyof stateMap)[] = ["idle", "walk", "jump", "hurt", "dead"]

	protected getFocus(): Vector {
		if (Camera.focusObjects.length > 1) return this.getCenterPoint()
		return this.getCenterPoint().plus(new Vector(this.focusOffset * this.direction, 0))
	}

	constructor() {
		super("player")
		this.dimensions.set(610, 1200).toScaled(0.4)
		this.position.set(0, 100)
		this.initialize()
	}

	protected override initialize(): void {
		this.setBehaviours()
		this.position.y = this.gravityBehavior!.floorHeight
		super.initialize("2_character_pepe/1_idle/idle/I-1.png")
	}

	protected override setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		const { walkSpeed, jumpStrength } = this

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
			assets: [
				"sfx/Jump.mp3",
				"sfx/Landing.mp3",
				"sfx/Walk.mp3",
				"sfx/Snore.mp3",
				"sfx/Death.mp3",
				"sfx/Hurt_1.mp3",
				"sfx/Hurt_2.mp3",
				"sfx/Hurt_3.mp3"
			]
		})
		this.collisionBehaviour = BehaviourFactory.create("collision", {
			targets: ["enemy", "endboss", "coin", "bottle"],
			offsets: [200, 60, 20, 45],
			cooldown: 1000
		}).onAttach(this)
		const { hp: healthPoints, bottle: bottles, coin: coins } = Settings.resources
		this.resourceBehaviour = BehaviourFactory.create("resource", { healthPoints, bottles, coins }).onAttach(this)
		this.triggerBehaviour = BehaviourFactory.create("trigger", [
			{
				name: "endbossSpawn",
				conditionCallback: () => Settings.spawnLocations.endboss < this.position.x + 1000,
				triggerCallback: () => Main.spawnEndboss()
			}
		]).onAttach(this)
	}

	protected getAnimationSet(): Pick<AnimationSet, PlayerAnimationState> {
		return {
			idle: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/1_idle/idle", 1, 10)),
			idle_long: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/1_idle/idle_long", 11, 20)),
			walk: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/2_walk", 21, 26)),
			jump: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/3_jump", 31, 39)),
			hurt: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/4_hurt", 41, 43)),
			dead: GameObject.getImages(GameObject.getSingleAnimation("2_character_pepe/5_dead", 51, 57))
		}
	}

	public throwBottle(): void {
		if (!this.resourceBehaviour?.use("bottles", 1)) return
		const spawnPosition = this.position
		new Bottle({ position: spawnPosition, velocity: this.movementBehaviour!.velocity, direction: this.direction })
		this.setState("idle")
	}

	public override collisionCallback(target: GameObject): void {
		// console.log(`player collided with ${target.name}`)
		switch (target.name) {
			case "coin":
				return this.resourceBehaviour?.add("coins", 1)
			// case "bottle":
			// 	return this.resourceBehaviour?.add("bottles", 1)
			case "enemy":
			case "endboss": {
				return this.collideWithEnemy(target)
			}
		}
		// this.resourceBehaviour?.receiveDamage(80)
	}

	private collideWithEnemy(target: GameObject): void {
		this.collisionBehaviour!.addCollisionCooldown("enemy", "endboss")
		const damage = target.name === "enemy" ? 40 : 80
		this.resourceBehaviour!.receiveDamage(damage)
		const { currentAmount, maxAmount } = this.resourceBehaviour!.healthPoints
		Gui.updateStatusBar("hp", currentAmount, maxAmount, true)
		if (this.resourceBehaviour!.healthPoints.currentAmount === 0) return this.die()
		this.setState("hurt")
		this.soundBehaviour!.playRandom(["Hurt_1", "Hurt_2", "Hurt_3"])
	}

	private die(): void {
		Input.toggleInput(false)
		this.setState("dead")
		this.soundBehaviour?.playOnce("Death")
		new Timer(() => {
			this.movementBehaviour = undefined
			Main.endGame(false)
		}, 1500).resume()
	}
}
