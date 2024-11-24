import { AnimationSet, EndbossAnimationState, stateMap } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import Enemy from "./enemy.object.js"
import Util from "../util/general.util.js"
import Timer from "../modules/timer.module.js"
import Gui from "../modules/gui.module.js"
import Main from "../modules/main.module.js"
import Camera from "../modules/camera.module.js"
import GameObject from "./gameObject.object.js"
import Settings from "../modules/settings.module.js"

@Util.Assets({
	img: [
		...GameObject.getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4),
		...GameObject.getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12),
		...GameObject.getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20),
		...GameObject.getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23),
		...GameObject.getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26)
	]
})
export default class Endboss extends Enemy {
	public direction: 1 | -1 = -1
	public states: (keyof stateMap)[] = ["walk", "alert", "attack", "hurt", "dead"]
	private healthBarElement = Util.getElement("#endboss-hp-bar")
	hasSpawned = false

	protected defaultState: keyof stateMap = "alert"

	constructor() {
		super({
			type: "endboss",
			walkSpeed: 0.2,
			colliderOffsets: [200, 60, 70, 60],
			healthPoints: 400
		})
		this.dimensions.set(1045, 1217).toScaled(0.5)
		this.position.set(Settings.spawnLocations.endboss, 100)
		this.initialize()
		this.spawn()
	}

	protected override initialize(): void {
		this.setBehaviours()
		super.initialize()
		this.healthBarElement.classList.add("d-none")
	}

	protected override setBehaviours(): void {
		super.setBehaviours()
		const animationSet = this.getAnimationSet()
		this.image = animationSet.alert[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
	}

	protected getAnimationSet(): Pick<AnimationSet, EndbossAnimationState> {
		return {
			walk: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4)),
			alert: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12)),
			attack: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20)),
			hurt: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23)),
			dead: GameObject.getImages(GameObject.getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26))
		}
	}

	public override collisionCallback(target: GameObject): void {
		switch (target.name) {
			case "bottle":
				return this.getHitByBottle(target)
			case "player":
				return this.attackPlayer()
		}
	}

	protected override getHitByBottle(bottle: GameObject): void {
		super.getHitByBottle(bottle)
		const { currentAmount, maxAmount } = this.resourceBehaviour!.healthPoints
		Gui.updateStatusBar("endbossHp", currentAmount, maxAmount)
		if (currentAmount > 0) this.setState("hurt")
	}

	private attackPlayer(): void {
		this.setState("attack")
	}

	protected override die(): void {
		super.die()
		Main.winGame()
		new Timer(() => Camera.focusObjects.remove(this), 2000).resume()
	}

	public spawn(): void {
		this.healthBarElement.classList.remove("d-none")
		Camera.focusObjects.push(this)
		new Timer(() => {
			this.hasSpawned = true
		}, 2000).resume()
	}

	private followPlayer(): void {
		const thisX = this.getCenterPoint().x
		const playerX = Main.player.getCenterPoint().x
		const direction = thisX < playerX ? 1 : -1
		this.direction = direction
		if (Math.abs(thisX - playerX) < this.dimensions.x / 2) return
		this.movementBehaviour!.input.isMovingRight = direction === 1
		this.movementBehaviour!.input.isMovingLeft = direction === -1
		if (this.state?.type !== "attack") this.setState("walk")
	}

	public override update(deltaTime: number): void {
		if (this.hasSpawned && this.resourceBehaviour!.healthPoints.currentAmount > 0) {
			this.followPlayer()
		}
		super.update(deltaTime)
	}
}
