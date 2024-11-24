import "../.types/prototypes.js"
import { keyInputAction, inputMap, mouseInputAction, audioTypes } from "../.types/types.js"
import Util from "../util/general.util.js"
import SoundManager from "../managers/sound.manager.js"
import KeyBindManager from "../managers/keybind.manager.js"
import Settings from "./settings.module.js"
import Main from "./main.module.js"
import Gui from "./gui.module.js"
import Renderer from "./renderer.module.js"

export default class Input {
	private static activeInputs: Set<keyInputAction | mouseInputAction> = new Set()
	public static isBlocked = false
	private static isKeyInputBlocked = false
	private static elementCache: Map<string, HTMLElement> = new Map()

	public static toggleKeyInput(bool?: boolean): boolean {
		if (bool !== undefined) this.isKeyInputBlocked = !bool
		else this.isKeyInputBlocked = !this.isKeyInputBlocked
		return this.isKeyInputBlocked
	}

	public static toggleInput(bool?: boolean): boolean {
		if (bool !== undefined) this.isBlocked = !bool
		else this.isBlocked = !this.isBlocked
		return this.isBlocked
	}

	public static keyMap: inputMap<"key"> = {
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

	static clickTargetMap: inputMap<"mouse"> = {
		...this.keyMap,
		OPEN_SETTINGS: {
			release: () => this.openWindow("settings")
		},
		OPEN_KEYBIND_SETTINGS: {
			release: () => this.openWindow("keyBindSettings")
		},
		OPEN_GAME_SETTINGS: {
			release: () => this.openGameSettings()
		},
		OPEN_SINGLE_KEYBIND: {
			release: (target) => KeyBindManager.openSingleKeyBind(target)
		},
		CANCEL_KEYBIND: {
			release: () => KeyBindManager.cancelKeybind()
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
		TOGGLE_FPS: {
			release: () => this.toggleFps()
		},
		NEW_GAME: {
			release: () => this.newGame()
		},
		RESUME_GAME: {
			release: () => this.togglePause()
		}
	}

	public static getElement<T extends HTMLElement>(sel: string): T {
		return this.elementCache.get(sel) as T
	}

	public static initialize(): void {
		KeyBindManager.initialize()
		this.cacheElements()
		window.addEventListener("pointerdown", (e) => this.clickHandler(e))
		window.addEventListener("keydown", (e) => this.keyHandler(e))
		window.addEventListener("keyup", (e) => this.keyHandler(e))
		// this.addZoomFunctionality()
		this.addVolumeSliderFunctionality()
		this.addSplashScreenFunctionality()
	}

	private static cacheElements(): void {
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
			"input#toggle-fps",
			"#fps-counter",
			"#main-menu",
			"[data-click='PAUSE']",
			"[data-click='TOGGLE_FULLSCREEN']",
			"[data-click='MOVE_LEFT']",
			"[data-click='MOVE_RIGHT']",
			"[data-click='JUMP']",
			"[data-click='THROW']"
		]
		elementSelectors.forEach((sel) => this.elementCache.set(sel, Util.getElement(sel)))
	}

	private static clickHandler(e: Event): void {
		if (!Util.pointerEventIsLeftClick(e)) return
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

	private static keyHandler(e: KeyboardEvent): void {
		if (this.isKeyInputBlocked) return
		// console.log(e.code)
		const isKeyDown = e.type === "keydown"
		const action = Object.entries(Settings.keyBindings).find(([, key]) => key === e.code)?.[0] as keyInputAction
		if (!action) return

		if (isKeyDown && !this.activeInputs.has(action)) this.pressKey(action)
		else if (!isKeyDown && this.activeInputs.has(action)) this.releaseKey(action)

		isKeyDown ? this.activeInputs.add(action) : this.activeInputs.delete(action)
	}

	private static pressKey(action: keyInputAction): void {
		this.keyMap[action].press?.(document.documentElement)
	}

	private static releaseKey(action: keyInputAction): void {
		this.keyMap[action].release?.(document.documentElement)
	}

	// Player Actions

	private static startMove(direction: "left" | "right"): void {
		if (this.isBlocked) return
		switch (direction) {
			case "left":
				Main.player.movementBehaviour!.input.isMovingLeft = true
				break
			case "right":
				Main.player.movementBehaviour!.input.isMovingRight = true
				break
		}
	}

	private static stopMove(direction: "left" | "right"): void {
		if (this.isBlocked) return
		if (direction === "left") Main.player.movementBehaviour!.input.isMovingLeft = false
		else if (direction === "right") Main.player.movementBehaviour!.input.isMovingRight = false
	}

	private static jump(bool: boolean): void {
		if (this.isBlocked) return
		Main.player.movementBehaviour!.input.isJumping = bool
	}

	private static throw(): void {
		if (this.isBlocked) return
		// console.log("throwing!")
		Main.player.throwBottle()
	}

	// gui actions

	private static enterMainMenu(): void {
		this.getElement(".splash-screen")?.remove()
		Gui.soundBehaviour.playLooped("Menu")
	}

	private static async toggleFullscreen(): Promise<void> {
		await Renderer.toggleFullscreen()
	}

	public static openWindow(id: string): void {
		this.getElement(`#${id}`)?.classList.add("open")
	}

	public static closeWindow(id: string): void {
		const container = this.getElement(`#${id}`)
		container.classList.remove("open")
		container.getAllElements(".open").forEach((el) => el.classList.remove("open"))
	}

	private static closeContainer(target: HTMLElement): void {
		const id = target.closest(".container")!.id
		this.closeWindow(id)
		if (id === "main-menu") this.resumeGame()
	}

	private static openAudioSettings(): void {
		Object.entries(SoundManager.volumes).forEach(
			([type, volume]) => (this.getElement<HTMLInputElement>(`input#${type}`).value = (volume * 100).toString())
		)
		this.openWindow("audio-settings")
	}

	private static openGameSettings(): void {
		this.getElement<HTMLInputElement>("input#toggle-fps").checked = Settings.fpsEnabled
		this.openWindow("game-settings")
	}

	private static toggleSnore(): void {
		Settings.snoreDisabled = !Settings.snoreDisabled
		const isDisabled = Settings.snoreDisabled
		const snoreSound = SoundManager.getSound("player/Snore")!
		Settings.saveSettings()
		if (!snoreSound) return
		isDisabled ? snoreSound.disable() : snoreSound.enable()
	}

	private static toggleFps(): void {
		Settings.fpsEnabled = !Settings.fpsEnabled
		Settings.saveSettings()
		this.getElement("#fps-counter").classList.toggle("d-none", !Settings.fpsEnabled)
	}

	private static togglePause(): void {
		const mainMenuIsOpen = this.getElement("#main-menu").classList.contains("open")
		mainMenuIsOpen ? this.resumeGame() : this.pauseGame()
	}

	public static pauseGame(): void {
		this.openWindow("main-menu")
		Main.pause()
	}

	public static resumeGame(): void {
		this.closeWindow("main-menu")
		Main.resume()
	}

	public static newGame(): void {
		this.getElement("#main-menu").classList.remove("start")
		Main.setupNewGame()
		Renderer.shouldUpdateStatically = false
		this.closeWindow("main-menu")
	}

	public static async restartGame(): Promise<void> {
		const restartConfirmed = await Util.confirmation({
			requestMessage: "Do you want to restart? All Progress will be lost!",
			affirmMessage: "Restart"
		})
		if (restartConfirmed) this.newGame()
	}

	private static addVolumeSliderFunctionality(): void {
		Util.getAllElements<HTMLInputElement>("input[type='range']").forEach((slider) => {
			slider.addEventListener("input", (e) => {
				const type = slider.id as keyof audioTypes
				SoundManager.setVolumeType(Number(slider.value) / 100, type)
			})
			slider.addEventListener("change", () => Settings.saveSettings())
		})
	}

	private static addSplashScreenFunctionality(): void {
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
