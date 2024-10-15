import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { CollisionBehaviour } from "../behaviours/collision.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { HealthBehaviour } from "../behaviours/health.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { ResourceBehaviour } from "../behaviours/resources.behaviour.js"
import { SoundBehaviour } from "../behaviours/sound.behaviour.js"
import { SoundAsset } from "../modules/sound_asset.module.js"
import { AnimationSet } from "./animation.type.js"

export type behaviourParamMap = {
	animation: animationParams
	draw: drawParams
	movement: movementParams
	gravity: gravityParams
	health: healthParams
	collision: collisionParams
	sound: soundParams
	resource: resourceParams
}

export type animationParams = {
	animationSet: Partial<AnimationSet>
}

export type drawParams = {
	isScaled: boolean
}

export type movementParams = {
	walkSpeed: number
	jumpStrength?: number
	clampToWorld?: boolean
}

export type gravityParams = {}

export type healthParams = {
	maximum: number
}

export type collisionParams = {
	offsets?: [number, number, number, number]
	damage?: number
	cooldown?: number
}

export type soundParams = SoundAsset[]

export type resourceParams = {
	healthPoints: number
	bottles?: number
	coins?: number
}

export type behaviourMap = {
	animation: AnimationBehaviour
	draw: DrawBehaviour
	movement: MovementBehaviour
	gravity: GravityBehaviour
	health: HealthBehaviour
	collision: CollisionBehaviour
	sound: SoundBehaviour
	resource: ResourceBehaviour
}
