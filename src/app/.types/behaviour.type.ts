import { AnimationBehaviour } from "../behaviours/animation.behaviour.js"
import { DrawBehaviour } from "../behaviours/draw.behaviour.js"
import { GravityBehaviour } from "../behaviours/gravity.behaviour.js"
import { MovementBehaviour } from "../behaviours/movement.behaviour.js"
import { AnimationSet } from "./animation.type.js"

export type BehaviourType = "animation" | "draw" | "movement" | "gravity"

export type AnimationParams = {
	animationSet: AnimationSet
}

export type BehaviourParamMap = {
	animation: AnimationParams
	draw: DrawParams
	movement: MovementParams
	gravity: GravityParams
}

type DrawParams = {}

export type MovementParams = {
	walkSpeed: number
	jumpStrength: number
}

type GravityParams = {}

export type BehaviourMap = {
	animation: AnimationBehaviour
	draw: DrawBehaviour
	movement: MovementBehaviour
	gravity: GravityBehaviour
}
