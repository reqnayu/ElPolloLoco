export type inputMap<T extends "key" | "mouse"> = Record<
	T extends "key" ? keyInputAction : mouseInputAction,
	{
		press: (e?: Event) => any
		release?: (e?: Event) => any
	}
>

export type keyInputAction = "MOVE_LEFT" | "MOVE_RIGHT" | "JUMP" | "PAUSE" | "FULLSCREEN" | "THROW"
export type mouseInputAction =
	| keyInputAction
	| "OPEN_SETTINGS"
	| "OPEN_KEYBIND_SETTINGS"
	| "OPEN_SINGLE_KEYBIND"
	| "CLOSE_CONTAINER"
	| "RESTART_GAME"
