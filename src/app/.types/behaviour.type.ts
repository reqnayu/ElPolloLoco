import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { CollisionBehaviour } from "../behaviours/collision.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { ResourceBehaviour } from "../behaviours/resources.behaviour.js"
import { SoundBehaviour, soundType } from "../behaviours/sound.behaviour.js"
import { GameObject } from "../gameObjects/gameObject.object.js"
import { SoundAsset } from "../modules/sound_asset.module.js"
import { AnimationSet } from "./animation.type.js"
import { GameObjectType } from "./gameObject.type.js"

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

export type gravityParams = {
	landCallback?(): void
}

export type healthParams = {
	maximum: number
}

export type collisionParams = {
	targets: GameObjectType[]
	offsets?: [number, number, number, number]
	damage?: number
	cooldown?: number
	collisionCallback?(target: GameObject): void
}

export type soundParams = {
	assets: string[]
	soundType: soundType
}

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
	collision: CollisionBehaviour
	sound: SoundBehaviour
	resource: ResourceBehaviour
}
