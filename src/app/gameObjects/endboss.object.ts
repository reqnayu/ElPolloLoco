import { AnimationSet, EndbossAnimationState } from "../.types/animation.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset.manager.js"
import { Enemy } from "./enemy.object.js"
import { GameObject, getImages, getSingleAnimation } from "./gameObject.object.js"
import { getElement } from "../util/general.util.js"
import { Timer } from "../modules/timer.module.js"
import { Gui } from "../modules/gui.module.js"
import { Main } from "../modules/main.module.js"
import { Camera } from "../modules/camera.module.js"

@Assets({
	img: [
		...getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4),
		...getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12),
		...getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20),
		...getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23),
		...getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26)
	]
})
export class Endboss extends Enemy {
	public direction: 1 | -1 = -1
	public states: (keyof stateMap)[] = ["walk", "alert", "attack", "hurt", "dead"]
	private healthBarElement = getElement("#endboss-hp-bar")
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
		this.position.set(2000, 100)
		this.initialize()
	}

	protected override initialize(): void {
		this.setBehaviours()
		super.setBehaviours()
		super.initialize()
		this.animationBehaviour?.setAnimation("alert")
		this.healthBarElement.classList.add("d-none")
	}

	protected override setBehaviours(): void {
		const animationSet = this.getAnimationSet()
		this.image = animationSet.alert[0]
		this.animationBehaviour = BehaviourFactory.create("animation", { animationSet }).onAttach(this)
	}

	protected getAnimationSet(): Pick<AnimationSet, EndbossAnimationState> {
		return {
			walk: getImages(getSingleAnimation("4_enemie_boss_chicken/1_walk", 1, 4)),
			alert: getImages(getSingleAnimation("4_enemie_boss_chicken/2_alert", 5, 12)),
			attack: getImages(getSingleAnimation("4_enemie_boss_chicken/3_attack", 13, 20)),
			hurt: getImages(getSingleAnimation("4_enemie_boss_chicken/4_hurt", 21, 23)),
			dead: getImages(getSingleAnimation("4_enemie_boss_chicken/5_dead", 24, 26))
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
		new Timer({
			handler: () => Camera.focusObjects.remove(this),
			timeout: 2000
		}).resume()
	}

	public spawn(): void {
		this.healthBarElement.classList.remove("d-none")
		Camera.focusObjects.push(this)
		new Timer({
			handler: () => {
				this.hasSpawned = true
			},
			timeout: 2000
		}).resume()
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

	update(deltaTime: number): void {
		if (this.hasSpawned && this.resourceBehaviour!.healthPoints.currentAmount > 0) {
			this.followPlayer()
		}
		super.update(deltaTime)
	}
}
