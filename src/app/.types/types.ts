import AnimationBehaviour from "../behaviours/animation.behaviour.js"
import CollisionBehaviour from "../behaviours/collision.behaviour.js"
import DrawBehaviour from "../behaviours/draw.behaviour.js"
import GravityBehaviour from "../behaviours/gravity.behaviour.js"
import MovementBehaviour from "../behaviours/movement.behaviour.js"
import ResourceBehaviour from "../behaviours/resources.behaviour.js"
import SoundBehaviour from "../behaviours/sound.behaviour.js"
import TriggerBehaviour from "../behaviours/trigger.behaviour.js"
import Background from "../gameObjects/background.object.js"
import Bottle from "../gameObjects/bottle.object.js"
import ChickenNormal from "../gameObjects/chicken_normal.object.js"
import ChickenSmall from "../gameObjects/chicken_small.object.js"
import Clouds from "../gameObjects/clouds.object.js"
import Coin from "../gameObjects/coin.object.js"
import Endboss from "../gameObjects/endboss.object.js"
import GameObject from "../gameObjects/gameObject.object.js"
import Player from "../gameObjects/player.object.js"
import SoundAsset from "../modules/sound_asset.module.js"
import Timer from "../modules/timer.module.js"
import Vector from "../modules/vector.module.js"
import AlertState from "../states/alert.state.js"
import AttackState from "../states/attack.state.js"
import DeadState from "../states/dead.state.js"
import HurtState from "../states/hurt.state.js"
import IdleState from "../states/idle.state.js"
import JumpState from "../states/jump.state.js"
import RotationState from "../states/rotation.state.js"
import WalkState from "../states/walk.state.js"

export type lang = "en" | "de"

export type audioTypes = {
	master?: undefined
	music: HTMLAudioElement[]
	sfx: HTMLAudioElement[]
	menu: HTMLAudioElement[]
}

export type statusBars = {
	hp: HTMLElement
	coin: HTMLElement
	bottle: HTMLElement
	endbossHp: HTMLElement
}

export type assetsParams = {
	img?: string[]
	audio?: string[]
}

export type soundType = GameObjectType | "gui"

export type trigger = {
	condition: () => boolean
	callback: () => void
}

export type behaviourParamMap = {
	animation: animationParams
	draw: drawParams
	movement: movementParams
	gravity: gravityParams
	health: healthParams
	collision: collisionParams
	sound: soundParams
	resource: resourceAmountParams
	trigger: triggerParams
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

export type resourceAmountParams = {
	healthPoints: number
	bottles?: number
	coins?: number
}

export type resourceParams = {
	maxAmount: number
	currentAmount?: number
}

export type triggerParams = trigger[]

export type behaviourMap = {
	animation: AnimationBehaviour
	draw: DrawBehaviour
	movement: MovementBehaviour
	gravity: GravityBehaviour
	collision: CollisionBehaviour
	sound: SoundBehaviour
	resource: ResourceBehaviour
	trigger: TriggerBehaviour
}

export type stateMap = {
	idle: IdleState
	walk: WalkState
	jump: JumpState
	alert: AlertState
	attack: AttackState
	dead: DeadState
	hurt: HurtState
	rotation: RotationState
}

export interface State {
	type: keyof stateMap
	timers?: Timer[]
	enter(gameObject: GameObject): void
	update(gameObject: GameObject, deltaTime: number): void
	exit(gameObject: GameObject): void
}

export type inputMap<T extends "key" | "mouse"> = Record<
	T extends "key" ? keyInputAction : mouseInputAction,
	{
		press?: (target: HTMLElement) => any
		release?: (target: HTMLElement) => any
	}
>

export type keyInputAction = "MOVE_LEFT" | "MOVE_RIGHT" | "JUMP" | "PAUSE" | "FULLSCREEN" | "THROW"

export type mouseInputAction = keyInputAction | string

export type GameObjectType = "player" | "bottle" | "enemy" | "endboss" | "background" | "clouds" | "coin"

export type Spawnable = Extract<GameObjectType, "coin" | "enemy" | "endboss">

export type GameObjectMap = {
	player: Player
	bottle: Bottle
	clouds: Clouds
	enemy: ChickenNormal | ChickenSmall
	endboss: Endboss
	background: Background
	coin: Coin
}

export type enemyParams = {
	type: Extract<GameObjectType, "enemy" | "endboss">
	spawnPosition: Vector
	walkSpeed: number
	colliderOffsets: [number, number, number, number]
	healthPoints: number
}

export type bottleParams = {
	position: Vector
	direction: 1 | -1
}

export type coinParams = {
	spawnPosition: Vector
	startFrame?: number
}

export type GameObjectParams = {
	player: undefined
	bottle: bottleParams
	clouds: undefined
	enemy: enemyParams
	endboss: undefined
	background: undefined
	coin: coinParams
}

export type Frame = {
	image: CanvasImageSource
	dx: number
	dy: number
	dWidth: number
	dHeight: number
	direction: -1 | 1
}

export interface Audible {
	sounds: Map<string, SoundAsset>
}

export type AnimationState =
	| "idle"
	| "idle_long"
	| "walk"
	| "jump"
	| "hurt"
	| "dead"
	| "alert"
	| "attack"
	| "rotation"
	| "splash"

export type PlayerAnimationState = Exclude<AnimationState, "alert" | "attack" | "rotation" | "splash">
export type EnemyAnimationState = Extract<AnimationState, "walk" | "dead">
export type EndbossAnimationState = Exclude<AnimationState, "idle" | "idle_long" | "jump" | "rotation" | "splash">
export type BottleAnimationState = Extract<AnimationState, "rotation" | "splash" | "idle">
export type CoinAnimationState = Extract<AnimationState, "idle">

export type AnimationSet = {
	[K in AnimationState]: CanvasImageSource[]
}

export type movementBehaviourInputMap = {
	isMovingRight: boolean
	isMovingLeft: boolean
	isJumping?: boolean
}
