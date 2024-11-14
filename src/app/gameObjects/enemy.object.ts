import { MESSAGER } from "../../script.js"
import { GameObjectType } from "../.types/gameObject.type.js"
import { stateMap } from "../.types/state.type.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { randomize } from "../util/general.util.js"
import { GameObject } from "./gameObject.object.js"

export class Enemy extends GameObject {
	direction: 1 | -1 = -1
	states: (keyof stateMap)[] = ["walk", "dead"]
	private colliderOffsets
	private healthPoints

	protected defaultState: keyof stateMap = "walk"

	constructor({ type, walkSpeed, colliderOffsets, healthPoints }: enemyParams) {
		super(type)
		this.walkSpeed = walkSpeed
		this.colliderOffsets = colliderOffsets
		this.healthPoints = healthPoints
		this.dimensions.set(236, 210)
		this.randomizeStartingPosition()
	}

	protected initialize(): void {
		super.initialize()
		this.position.y = this.gravityBehavior!.floorHeight
		this.setState()
	}

	protected setBehaviours(): void {
		this.drawBehaviour = BehaviourFactory.create("draw").onAttach(this)
		this.movementBehaviour = BehaviourFactory.create("movement", {
			walkSpeed: this.walkSpeed,
			jumpStrength: 0.7
		}).onAttach(this)
		// this.movementBehaviour.input.isMovingLeft = true
		this.gravityBehavior = BehaviourFactory.create("gravity").onAttach(this)
		this.collisionBehaviour = BehaviourFactory.create("collision", {
			cooldown: 500,
			offsets: this.colliderOffsets,
			targets: ["bottle", "player"],
			damage: 20
		}).onAttach(this)
		this.resourceBehaviour = BehaviourFactory.create("resource", { healthPoints: this.healthPoints }).onAttach(this)
	}

	protected randomizeStartingPosition(): void {
		const minX = 1000
		const maxX = 2000
		const randomX = randomize(minX, maxX)
		this.position.x = randomX
	}

	collisionCallback(target: GameObject): void {
		switch (target.name) {
			case "bottle": {
				this.getHitByBottle(target)
				// console.log("bottle hit")
				return
			}
		}
	}

	protected getHitByBottle(bottle: GameObject): void {
		this.resourceBehaviour?.receiveDamage(bottle.collisionBehaviour!.damage)
		if (this.resourceBehaviour?.healthPoints.currentAmount === 0) {
			// console.log("dying")
			this.die()
		}
	}

	protected die(): void {
		this.collisionBehaviour!.targets = []
		this.setState("dead")
		this.movementBehaviour?.stopMoving()
	}
}

type enemyParams = {
	type: Extract<GameObjectType, "enemy" | "endboss">
	walkSpeed: number
	colliderOffsets: [number, number, number, number]
	healthPoints: number
}
