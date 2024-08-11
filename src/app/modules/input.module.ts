import { MESSAGER } from "../../script.js"
import { delegateEvent } from "../util/general.util.js"
import { ClickTargetMap } from "../.types/input.type.js"

export class Input {
	main
	keyMappings = {
		MOVE_LEFT: "a",
		MOVE_RIGHT: "d",
		JUMP: " ",
		TOGGLE_PAUSE: "Escape"
	}
	activeKeys: Set<string> = new Set()
	clickTargetMap: ClickTargetMap = new Map([
		["pause", () => this.togglePause()],
		["test", () => this.main.toggleRender()]
	])

	constructor() {
		this.main = MESSAGER.dispatch("main")
		this.initialize()
	}

	initialize(): void {
		const guiElement = document.querySelector("#gui")
		if (!guiElement) return
		delegateEvent("click", (e) => this.clickHandler(e))
		window.addEventListener("keydown", (e) => this.keyHandler(e))
		window.addEventListener("keyup", (e) => this.keyHandler(e))
		MESSAGER.elements.set("input", this)
	}

	clickHandler(event: Event): void {
		this.clickTargetMap.forEach((cb, name) => {
			if (!(event.target instanceof HTMLElement)) return
			const attr = event.target.dataset.click
			if (!attr || attr !== name) return
			cb()
		})
	}

	keyHandler(event: KeyboardEvent): void {
		if (!Object.values(this.keyMappings).includes(event.key)) return
		const isKeyDown = event.type === "keydown"
		if (event.key === "Escape" && isKeyDown) return this.togglePause()
		if (this.activeKeys.has(event.key) === isKeyDown) return

		isKeyDown ? this.activeKeys.add(event.key) : this.activeKeys.delete(event.key)
		const { input } = MESSAGER.dispatch("main").player
		switch (event.key) {
			case this.keyMappings.MOVE_LEFT:
				input.isMovingLeft = isKeyDown
				break
			case this.keyMappings.MOVE_RIGHT:
				input.isMovingRight = isKeyDown
				break
			case this.keyMappings.JUMP:
				input.isJumping = isKeyDown
				break
		}
	}

	togglePause(): void {
		this.main.togglePause()
	}
}
