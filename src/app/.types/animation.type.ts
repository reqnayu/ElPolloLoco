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
export type BottleAnimationState = Extract<AnimationState, "rotation" | "splash">

export type AnimationSet = {
	[K in AnimationState]: CanvasImageSource[]
}
