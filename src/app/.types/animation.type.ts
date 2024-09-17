export type AnimationState = "idle" | "idle_long" | "walk" | "jump" | "hurt" | "dead" | "alert" | "attack"

export type PlayerAnimationState = Exclude<AnimationState, "alert" | "attack">
export type EnemyAnimationState = Extract<AnimationState, "walk" | "dead">
export type EndbossAnimationState = Exclude<AnimationState, "idle" | "idle_long" | "jump">

export type AnimationSet = {
	[K in AnimationState]: CanvasImageSource[]
}
