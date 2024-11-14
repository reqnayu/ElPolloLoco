import "../.types/prototypes.js"
import { MESSAGER } from "../../script.js"
import { confirmation, getAllElements, getElement, pointerEventIsLeftClick } from "../util/general.util.js"
import { keyInputAction, inputMap, mouseInputAction } from "../.types/input.type.js"
import { audioTypes } from "../managers/sound_manager.module.js"
import { KeyBindManager } from "../managers/keybind_manager.module.js"

export class Input {
	main
	activeInputs: Set<keyInputAction | mouseInputAction> = new Set()
	isBlocked = false
	isKeyInputBlocked = true
	private keyBindManager
	elementCache: Map<string, HTMLElement> = new Map()

	keyMap: inputMap<"key"> = {
		FULLSCREEN: {
			release: () => this.toggleFullscreen()
		},
		PAUSE: {
			release: () => this.togglePause()
		},
		JUMP: {
			press: () => this.jump(true),
			release: () => this.jump(false)
		},
		MOVE_LEFT: {
			press: () => this.startMove("left"),
			release: () => this.stopMove("left")
		},
		MOVE_RIGHT: {
			press: () => this.startMove("right"),
			release: () => this.stopMove("right")
		},
		THROW: {
			release: () => this.throw()
		}
	}

	clickTargetMap: inputMap<"mouse"> = {
		...this.keyMap,
		OPEN_SETTINGS: {
			release: () => this.openWindow("settings")
		},
		OPEN_KEYBIND_SETTINGS: {
			release: () => this.openWindow("keyBindSettings")
		},
		OPEN_GAME_SETTINGS: {
			release: () => this.openWindow("game-settings")
		},
		OPEN_SINGLE_KEYBIND: {
			release: (target) => this.keyBindManager.openSingleKeyBind(target)
		},
		CANCEL_KEYBIND: {
			release: () => this.keyBindManager.cancelKeybind()
		},
		OPEN_AUDIO_SETTINGS: {
			release: () => this.openAudioSettings()
		},
		CLOSE_CONTAINER: {
			release: (target) => this.closeContainer(target)
		},
		RESTART_GAME: {
			release: () => this.restartGame()
		},
		TOGGLE_SNORE: {
			release: () => this.toggleSnore()
		},
		NEW_GAME: {
			release: () => this.newGame()
		},
		RESUME_GAME: {
			release: () => this.togglePause()
		}
	}

	constructor() {
		this.main = MESSAGER.dispatch("main")
		this.keyBindManager = new KeyBindManager(this)
		this.cacheElements()
		this.initialize()
	}

	private cacheElements(): void {
		const elementSelectors = [
			"#gui",
			"#settings",
			"#game-settings",
			"#audio-settings",
			"#keyBindSettings",
			"#keyBindModal",
			".splash-screen",
			"input#master",
			"input#sfx",
			"input#music",
			"input#menu",
			"input#snore",
			"#main-menu",
			"[data-click='PAUSE']",
			"[data-click='TOGGLE_FULLSCREEN']",
			"[data-click='MOVE_LEFT']",
			"[data-click='MOVE_RIGHT']",
			"[data-click='JUMP']",
			"[data-click='THROW']"
		]
		elementSelectors.forEach((sel) => this.elementCache.set(sel, getElement(sel)))
	}

	getElement<T extends HTMLElement>(sel: string): T {
		return this.elementCache.get(sel) as T
	}

	initialize(): void {
		window.addEventListener("pointerdown", (e) => this.clickHandler(e))
		window.addEventListener("keydown", (e) => this.keyHandler(e))
		window.addEventListener("keyup", (e) => this.keyHandler(e))
		// this.addZoomFunctionality()
		this.addVolumeSliderFunctionality()
		this.addSplashScreenFunctionality()
		MESSAGER.elements.set("input", this)
	}

	clickHandler(e: Event): void {
		if (!pointerEventIsLeftClick(e)) return
		const target = (e.target as HTMLElement).closest<HTMLElement>("[data-click]")
		if (!target) return
		const action = target?.dataset.click
		if (!action) return
		const clickFunc = this.clickTargetMap[action]
		clickFunc?.press?.(target)
		const ac = new AbortController()
		if (target.closest("footer") && target.classList.contains("btn-input")) {
			target.addEventListener(
				"pointerleave",
				(e) => {
					clickFunc?.release?.(target)
					ac.abort()
				},
				{ signal: ac.signal }
			)
		}
		window.addEventListener(
			"pointerup",
			(e) => {
				if (e.target === target || (e.target as HTMLElement).closest(`[data-click="${action}"]`))
					clickFunc?.release?.(target)
			},
			{ once: true, signal: ac.signal }
		)
	}

	private keyHandler(e: KeyboardEvent): void {
		if (this.isKeyInputBlocked) return
		// console.log(e.code)
		const isKeyDown = e.type === "keydown"
		const action = Object.entries(this.main.settings.keyBindings).find(
			([, key]) => key === e.code
		)?.[0] as keyInputAction
		if (!action) return

		if (isKeyDown && !this.activeInputs.has(action)) this.pressKey(action)
		else if (!isKeyDown && this.activeInputs.has(action)) this.releaseKey(action)

		isKeyDown ? this.activeInputs.add(action) : this.activeInputs.delete(action)
	}

	private pressKey(action: keyInputAction): void {
		this.keyMap[action].press?.(document.documentElement)
	}

	private releaseKey(action: keyInputAction): void {
		this.keyMap[action].release?.(document.documentElement)
	}

	// Player Actions

	private startMove(direction: "left" | "right"): void {
		if (this.isBlocked) return
		switch (direction) {
			case "left":
				this.main.player.movementBehaviour!.input.isMovingLeft = true
				break
			case "right":
				this.main.player.movementBehaviour!.input.isMovingRight = true
				break
		}
	}

	private stopMove(direction: "left" | "right"): void {
		if (this.isBlocked) return
		if (direction === "left") this.main.player.movementBehaviour!.input.isMovingLeft = false
		else if (direction === "right") this.main.player.movementBehaviour!.input.isMovingRight = false
	}

	private jump(bool: boolean): void {
		if (this.isBlocked) return
		this.main.player.movementBehaviour!.input.isJumping = bool
	}

	private throw(): void {
		if (this.isBlocked) return
		// console.log("throwing!")
		this.main.player.throwBottle()
	}

	// gui actions

	private enterMainMenu(): void {
		this.getElement(".splash-screen")?.remove()
		this.main.gui.soundBehaviour.playLooped("Menu")
	}

	private async toggleFullscreen(): Promise<void> {
		await this.main.renderer.toggleFullscreen()
	}

	openWindow(id: string): void {
		this.getElement(`#${id}`)?.classList.add("open")
	}

	closeWindow(id: string): void {
		const container = this.getElement(`#${id}`)
		container.classList.remove("open")
		container.getAllElements(".open").forEach((el) => el.classList.remove("open"))
	}

	private closeContainer(target: HTMLElement): void {
		const id = target.closest(".container")!.id
		this.closeWindow(id)
		if (id === "main-menu") this.resumeGame()
	}

	private openAudioSettings(): void {
		Object.entries(this.main.soundManager.volumes).forEach(
			([type, volume]) => (this.getElement<HTMLInputElement>(`input#${type}`).value = (volume * 100).toString())
		)
		this.getElement<HTMLInputElement>("input#snore").checked = !this.main.settings.snoreDisabled
		this.openWindow("audio-settings")
	}

	private toggleSnore(): void {
		this.main.settings.snoreDisabled = !this.main.settings.snoreDisabled
		const isDisabled = this.main.settings.snoreDisabled
		const snoreSound = MESSAGER.dispatch("soundManager").allAudioElements.get("player/Snore")!
		this.main.settings.saveSettings()
		if (!snoreSound) return
		isDisabled ? snoreSound.disable() : snoreSound.enable()
	}

	private togglePause(): void {
		const mainMenuIsOpen = this.getElement("#main-menu").classList.contains("open")
		mainMenuIsOpen ? this.resumeGame() : this.pauseGame()
	}

	pauseGame(): void {
		this.openWindow("main-menu")
		this.main.pause()
	}

	resumeGame(): void {
		this.closeWindow("main-menu")
		this.main.resume()
	}

	newGame(): void {
		this.getElement("#main-menu").classList.remove("start")
		this.main.setupNewGame()
		this.main.renderer.shouldUpdateStatically = false
		this.closeWindow("main-menu")
	}

	async restartGame(): Promise<void> {
		const restartConfirmed = await confirmation({
			requestMessage: "Do you want to restart? All Progress will be lost!",
			affirmMessage: "Restart"
		})
		if (restartConfirmed) this.newGame()
	}

	// addZoomFunctionality(): void {
	// 	this.getElement("#gui").addEventListener("wheel", (e) => {
	// 		const direction = e.deltaY > 0 ? 1 : -1
	// 		MESSAGER.dispatch("main").renderer.camera.changeZoom(direction)
	// 	})
	// }

	private addVolumeSliderFunctionality(): void {
		getAllElements<HTMLInputElement>("input[type='range']").forEach((slider) => {
			slider.addEventListener("input", (e) => {
				const type = slider.id as keyof audioTypes
				this.main.soundManager.setVolumeType(Number(slider.value) / 100, type)
			})
			slider.addEventListener("change", () => this.main.settings.saveSettings())
		})
	}

	private addSplashScreenFunctionality(): void {
		const ac = new AbortController()
		const splashScreenFunc = (e: Event) => {
			const keyboardEvent = e as KeyboardEvent
			e.preventDefault()
			const falseKeys = ["ShiftLeft", "ShiftRight", "AltLeft", "AltRight", "ControlLeft", "ControlRight"]
			if (falseKeys.includes(keyboardEvent.code)) return
			this.enterMainMenu()
			ac.abort()
		}
		const eventTypes: (keyof WindowEventMap)[] = ["click", "touchend", "keyup"]
		eventTypes.forEach((type) => window.addEventListener(type, splashScreenFunc, { signal: ac.signal }))
	}
}
