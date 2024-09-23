import { keyInputAction } from "../.types/input.type.js"

export class Settings {
	keyBindings: Record<keyInputAction, string> = {
		MOVE_RIGHT: "KeyD",
		MOVE_LEFT: "KeyA",
		JUMP: "Space",
		PAUSE: "Tab",
		FULLSCREEN: "KeyF",
		THROW: "KeyT"
	}

	async setKeyBind(action: keyof typeof this.keyBindings, key: string): Promise<void> {
		this.keyBindings[action] = key
	}

	keyBindExists(key: string): boolean {
		return this.keyBindings.hasOwnProperty(key)
	}
}
