export type AnimationState = "idle" | "idle_long" | "walk" | "jump" | "hurt" | "dead" | "alert" | "attack" | "rotation"

export type PlayerAnimationState = Exclude<AnimationState, "alert" | "attack" | "rotation">
export type EnemyAnimationState = Extract<AnimationState, "walk" | "dead">
export type EndbossAnimationState = Exclude<AnimationState, "idle" | "idle_long" | "jump" | "rotation">
export type BottleAnimationState = Extract<AnimationState, "rotation">

export type AnimationSet = {
	[K in AnimationState]: CanvasImageSource[]
}
