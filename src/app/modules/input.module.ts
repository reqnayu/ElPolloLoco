import "../.types/prototypes.js"
import { keyInputAction, inputMap, mouseInputAction, audioTypes, lang, resourceAmountParams } from "../.types/types.js"
import Util from "../util/general.util.js"
import SoundManager from "../managers/sound.manager.js"
import KeyBindManager from "../managers/keybind.manager.js"
import Settings from "./settings.module.js"
import Main from "./main.module.js"
import Gui from "./gui.module.js"
import Renderer from "./renderer.module.js"
import { Language } from "./language.module.js"

export default class Input {
	private static activeInputs: Set<keyInputAction | mouseInputAction> = new Set()
	public static isPlayerInputBlocked = true
	private static isBlocked = true

	public static toggleInput(bool?: boolean): boolean {
		if (bool !== undefined) this.isBlocked = !bool
		else this.isBlocked = !this.isBlocked
		return this.isBlocked
	}

	public static togglePlayerInput(bool?: boolean): boolean {
		if (bool !== undefined) this.isPlayerInputBlocked = !bool
		else this.isPlayerInputBlocked = !this.isPlayerInputBlocked
		return this.isPlayerInputBlocked
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
			release: () => Gui.openWindow("settings")
		},
		OPEN_KEYBIND_SETTINGS: {
			release: () => this.openKeyBindSettings()
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
		CHANGE_LANGUAGE: {
			release: (target) => this.changeLanguage(target)
		},
		TOGGLE_FPS: {
			release: () => this.toggleFps()
		},
		NEW_GAME: {
			release: () => this.newGame()
		},
		MAIN_MENU: {
			release: () => this.backToMainMenu()
		},
		IMPRINT: {
			release: () => this.openImprint()
		},
		RESUME_GAME: {
			release: () => this.togglePause()
		},
		BUY_HEALTH: {
			release: () => this.buyHealth()
		},
		BUY_BOTTLE: {
			release: () => this.buyBottle()
		}
	}

	public static initialize(): void {
		KeyBindManager.initialize()
		window.addEventListener("pointerdown", (e) => this.clickHandler(e))
		window.addEventListener("keydown", (e) => this.keyHandler(e))
		window.addEventListener("keyup", (e) => this.keyHandler(e))
		// this.addZoomFunctionality()
		this.addVolumeSliderFunctionality()
		this.addSplashScreenFunctionality()
		this.addScreenOrientationFunctionality()
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
		if (this.isBlocked) return
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
		if (this.isPlayerInputBlocked) return
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
		if (this.isPlayerInputBlocked) return
		if (direction === "left") Main.player.movementBehaviour!.input.isMovingLeft = false
		else if (direction === "right") Main.player.movementBehaviour!.input.isMovingRight = false
	}

	private static jump(bool: boolean): void {
		if (this.isPlayerInputBlocked) return
		Main.player.movementBehaviour!.input.isJumping = bool
	}

	private static throw(): void {
		if (this.isPlayerInputBlocked) return
		// console.log("throwing!")
		Main.player.throwBottle()
	}

	private static buyHealth(): void {
		this.buyResource("healthPoints", Settings.itemCosts.healthPoints, 50)
	}

	private static buyBottle(): void {
		this.buyResource("bottles", Settings.itemCosts.bottles)
	}

	private static buyResource(type: keyof resourceAmountParams, cost: number, amount = 1): void {
		const resourceBehaviour = Main.player.resourceBehaviour!
		if (resourceBehaviour[type]!.fraction === 1) return resourceBehaviour[type]!.emptyUse()
		if (resourceBehaviour.use("coins", cost) === false) return
		resourceBehaviour.add(type, amount)
	}

	// gui actions

	private static openImprint(): void {
		Gui.openWindow("imprint")
	}

	private static async backToMainMenu(): Promise<void> {
		const toMenuConfirmed =
			Gui.getElement("#end-screen").classList.contains("open") ||
			(await Util.confirmation({
				requestMessage: Language.get("main_menu_request_message")
			}))
		if (toMenuConfirmed) this.enterMainMenu()
	}

	private static async enterMainMenu(): Promise<void> {
		Gui.getElement(".splash-screen")?.remove()
		Gui.openWindow("main-menu").classList.add("start")
		Gui.closeWindow("end-screen")
		Gui.soundBehaviour.stop("Game")
		Gui.soundBehaviour.playLooped("Menu")
	}

	private static async toggleFullscreen(): Promise<void> {
		await Renderer.toggleFullscreen()
	}

	private static closeContainer(target: HTMLElement): void {
		const id = target.closest(".container")!.id
		Gui.closeWindow(id)
		if (id === "main-menu") this.resumeGame()
	}

	private static openAudioSettings(): void {
		Object.entries(SoundManager.volumes).forEach(
			([type, volume]) => (Gui.getElement<HTMLInputElement>(`input#${type}`).value = (volume * 100).toString())
		)
		Gui.openWindow("audio-settings")
	}

	private static openGameSettings(): void {
		Gui.getElement<HTMLInputElement>("input#toggle-fps").checked = Settings.fpsEnabled
		Util.getElement(`[data-lang-setting="${Settings.language}"]`).classList.add("border")
		Gui.openWindow("game-settings")
	}

	private static openKeyBindSettings(): void {
		KeyBindManager.renderKeybinds()
		Gui.openWindow("keyBindSettings")
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
		Gui.getElement("#fps-counter").classList.toggle("d-none", !Settings.fpsEnabled)
	}

	private static changeLanguage(target: HTMLElement): void {
		const lang = target.dataset.langSetting as lang
		Language.change(lang)
		target
			.parentElement!.getAllElements("button")
			.forEach((button) => button.classList.toggle("border", button === target))
	}

	private static togglePause(): void {
		const mainMenuIsOpen = Gui.getElement("#main-menu").classList.contains("open")
		mainMenuIsOpen ? this.resumeGame() : this.pauseGame()
	}

	public static pauseGame(): void {
		Gui.openWindow("main-menu")
		Main.pause()
	}

	public static resumeGame(): void {
		Gui.closeWindow("main-menu")
		Main.resume()
	}

	public static newGame(): void {
		Gui.getElement("#main-menu").classList.remove("start")
		Main.setupNewGame()
		Gui.closeWindow("main-menu")
		Gui.closeWindow("end-screen")
		this.isPlayerInputBlocked = false
		this.isBlocked = false
	}

	public static async restartGame(): Promise<void> {
		const restartConfirmed = await Util.confirmation({
			requestMessage: Language.get("restart_game_request_message"),
			affirmMessage: Language.get("restart_game_affirm_message")
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

	private static addScreenOrientationFunctionality(): void {
		screen.orientation.addEventListener("change", () => {
			if (screen.orientation.type === "landscape-primary" || screen.orientation.type === "landscape-secondary")
				return
			this.pauseGame()
		})
	}
}
