export type AnimationState = "idle" | "idle_long" | "walk" | "jump" | "hurt" | "dead"

export type AnimationSet = {
	[K in AnimationState]: CanvasImageSource[]
}
