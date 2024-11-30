import { enemyParams, GameObjectType, stateMap } from "../.types/types.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import CollisionManager from "../managers/collision.manager.js"
import Camera from "../modules/camera.module.js"
import Main from "../modules/main.module.js"
import Settings from "../modules/settings.module.js"
import GameObject from "./gameObject.object.js"

export default abstract class Enemy extends GameObject {
	direction: 1 | -1 = -1
	protected states: (keyof stateMap)[] = ["walk", "dead"]
	private colliderOffsets
	private healthPoints
	private type: Extract<GameObjectType, "enemy" | "endboss">

	protected defaultState: keyof stateMap = "walk"

	constructor({ type, spawnPosition, walkSpeed, colliderOffsets, healthPoints }: enemyParams) {
		super(type)
		this.type = type
		this.walkSpeed = walkSpeed
		this.colliderOffsets = colliderOffsets
		this.healthPoints = healthPoints
		this.dimensions.set(236, 210)
		this.position.set(spawnPosition)
	}

	protected override initialize(): void {
		super.initialize()
		this.setState()
	}

	protected override setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", {
			walkSpeed: this.walkSpeed,
			jumpStrength: 0.7
		}).onAttach(this)
		this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", {
			cooldown: 500,
			offsets: this.colliderOffsets,
			targets: ["bottle", "player"],
			damage: Settings.damage[this.type]
		}).onAttach(this)
		this.resourceBehaviour = BehaviourFactory.create("resource", { healthPoints: this.healthPoints }).onAttach(this)
		this.triggerBehaviour = BehaviourFactory.create("trigger", [
			{
				condition: () => this.position.x < Main.player.position.x + Camera._baseResolution.x,
				callback: () => this.startActing()
			}
		])
	}

	public override collisionCallback(target: GameObject): void {
		switch (target.name) {
			case "bottle": {
				this.getHitByBottle(target)
				return
			}
		}
	}

	protected startActing(): void {
		this.movementBehaviour!.input.isMovingLeft = true
	}

	protected getHitByBottle(bottle: GameObject): void {
		this.resourceBehaviour?.receiveDamage(bottle.collisionBehaviour!.damage)
		if (this.resourceBehaviour?.healthPoints.currentAmount === 0) {
			this.die()
		}
	}

	public die(): void {
		CollisionManager.removeObject(this.id)
		this.collisionBehaviour!.targets = []
		this.setState("dead")
		this.movementBehaviour?.stopMoving()
	}
}
