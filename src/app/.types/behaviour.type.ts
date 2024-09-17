import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { CollisionBehaviour } from "../behaviours/collision.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { HealthBehaviour } from "../behaviours/health.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { AnimationSet } from "./animation.type.js"

export type AnimationParams = {
	animationSet: Partial<AnimationSet>
}

export type BehaviourParamMap = {
	animation: AnimationParams
	draw: DrawParams
	movement: MovementParams
	gravity: GravityParams
	health: HealthParams
	collision: CollisionParams
}

export type DrawParams = {
	isScaled: boolean
}

export type MovementParams = {
	walkSpeed: number
	jumpStrength?: number
}

export type GravityParams = {}

export type HealthParams = {
	maximum: number
}

export type CollisionParams = {
	damage: number
}

export type BehaviourMap = {
	animation: AnimationBehaviour
	draw: DrawBehaviour
	movement: MovementBehaviour
	gravity: GravityBehaviour
	health: HealthBehaviour
	collision: CollisionBehaviour
}
