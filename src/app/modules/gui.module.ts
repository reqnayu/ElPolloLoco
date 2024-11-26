import { statusBars } from "../.types/types.js"
import SoundBehaviour from "../behaviours/sound.behaviour.js"
import BehaviourFactory from "../factories/behaviour.factory.js"
import SoundManager from "../managers/sound.manager.js"
import Util from "../util/general.util.js"
import Settings from "./settings.module.js"

@Util.Assets({
	img: [
		"7_statusbars/1_statusbar/1_statusbar_coin/blue/0.png",
		"7_statusbars/1_statusbar/1_statusbar_coin/blue/20.png",
		"7_statusbars/1_statusbar/1_statusbar_coin/blue/40.png",
		"7_statusbars/1_statusbar/1_statusbar_coin/blue/60.png",
		"7_statusbars/1_statusbar/1_statusbar_coin/blue/80.png",
		"7_statusbars/1_statusbar/1_statusbar_coin/blue/100.png",
		"7_statusbars/1_statusbar/2_statusbar_health/green/0.png",
		"7_statusbars/1_statusbar/2_statusbar_health/green/20.png",
		"7_statusbars/1_statusbar/2_statusbar_health/green/40.png",
		"7_statusbars/1_statusbar/2_statusbar_health/green/60.png",
		"7_statusbars/1_statusbar/2_statusbar_health/green/80.png",
		"7_statusbars/1_statusbar/2_statusbar_health/green/100.png",
		"7_statusbars/1_statusbar/3_statusbar_bottle/orange/0.png",
		"7_statusbars/1_statusbar/3_statusbar_bottle/orange/20.png",
		"7_statusbars/1_statusbar/3_statusbar_bottle/orange/40.png",
		"7_statusbars/1_statusbar/3_statusbar_bottle/orange/60.png",
		"7_statusbars/1_statusbar/3_statusbar_bottle/orange/80.png",
		"7_statusbars/1_statusbar/3_statusbar_bottle/orange/100.png"
	],
	audio: [
		"gui/ButtonDown.mp3",
		"gui/ButtonUp.mp3",
		"gui/Countdown.mp3",
		"gui/Countdown_go.mp3",
		"gui/Menu.mp3",
		"gui/Game.mp3"
	]
})
export default abstract class Gui {
	private static elementCache: Map<string, HTMLElement> = new Map()
	public static soundBehaviour: SoundBehaviour
	private static buttons: HTMLElement[] = []
	private static statusBars: statusBars

	public static async initialize(): Promise<void> {
		this.cacheElements()
		this.soundBehaviour = BehaviourFactory.create("sound", {
			soundType: "gui",
			assets: [
				"sfx/ButtonDown.mp3/false",
				"sfx/ButtonUp.mp3/false",
				"sfx/Countdown.mp3",
				"sfx/Countdown_go.mp3",
				"music/Menu.mp3/false",
				"music/Game.mp3/false"
			]
		})
		this.statusBars = {
			hp: this.getElement("#hp-bar"),
			coin: this.getElement("#coin-bar"),
			bottle: this.getElement("#bottle-bar"),
			endbossHp: this.getElement("#endboss-hp-bar")
		}
		this.getButtons()
		this.attachSounds()
		this.loadSettings()
	}

	private static cacheElements(): void {
		const elementSelectors = [
			"#gui",
			"#settings",
			"#game-settings",
			"#audio-settings",
			"#keyBindSettings",
			"#keyBindModal",
			"#end-screen",
			".splash-screen",
			"input#master",
			"input#sfx",
			"input#music",
			"input#menu",
			"input#snore",
			"input#toggle-fps",
			"#fps-counter",
			"#main-menu",
			"#hp-bar",
			"#coin-bar",
			"#bottle-bar",
			"#endboss-hp-bar",
			"#hp-buy",
			"#bottle-buy",
			"[data-click='PAUSE']",
			"[data-click='TOGGLE_FULLSCREEN']",
			"[data-click='MOVE_LEFT']",
			"[data-click='MOVE_RIGHT']",
			"[data-click='JUMP']",
			"[data-click='THROW']"
		]
		elementSelectors.forEach((sel) => this.elementCache.set(sel, Util.getElement(sel)))
	}

	public static getElement<T extends HTMLElement>(sel: string): T {
		return this.elementCache.get(sel) as T
	}

	public static openWindow(id: string): HTMLElement {
		const window = this.getElement(`#${id}`)
		window.classList.add("open")
		return window
	}

	public static closeWindow(id: string, closeChildren = true): HTMLElement {
		const window = this.getElement(`#${id}`)
		window.classList.remove("open")
		if (closeChildren) window.getAllElements(".open").forEach((el) => el.classList.remove("open"))
		return window
	}

	public static async reset(): Promise<void> {
		this.setUpStatusBars()
		await this.soundBehaviour.fadeOut("Menu", 1000)
		this.soundBehaviour.playLooped("Game")
	}

	private static setUpStatusBars(): void {
		Object.keys(this.statusBars).forEach((type) => {
			const maxAmount = Settings.resources[type as keyof statusBars]
			this.updateStatusBar(type as keyof statusBars, type === "coin" ? 0 : maxAmount, maxAmount)
		})
	}

	public static updateStatusBar(
		type: keyof statusBars,
		currentAmount: number,
		maxAmount: number,
		showError = false
	): void {
		const roundedPercent = Util.roundTo(currentAmount / maxAmount, 2)
		this.statusBars[type].style.setProperty("--value", roundedPercent.toString())
		this.statusBars[type].getElement(".current-amount").innerHTML = currentAmount.toString()
		this.statusBars[type].getElement(".max-amount").innerHTML = maxAmount.toString()
		if (showError === true) return this.statusBarError(type)
	}

	private static getButtons(): void {
		this.buttons = Util.getAllElements("#game button, input[type='checkbox']")
	}

	private static attachSounds(): void {
		const buttonDownSound = this.soundBehaviour.getSound("ButtonDown")
		const buttonUpSound = this.soundBehaviour.getSound("ButtonUp")
		this.buttons
			.filter((btn) => !btn.classList.contains("no-sound"))
			.forEach((btn) => {
				btn.addEventListener("pointerdown", (e) => {
					if (!Util.pointerEventIsLeftClick(e)) return
					buttonDownSound?.playOnce()
					btn.addEventListener(
						"pointerup",
						(e) => {
							if (!Util.pointerEventIsLeftClick(e)) return
							buttonUpSound?.playOnce()
						},
						{ once: true }
					)
				})
			})
	}

	private static loadSettings(): void {
		this.getElement<HTMLInputElement>("input#snore").checked = !Settings.snoreDisabled
		this.getElement<HTMLInputElement>("input#toggle-fps").checked = Settings.fpsEnabled
		this.getElement("#fps-counter").classList.toggle("d-none", !Settings.fpsEnabled)
		this.getElement("#hp-buy").innerText = Settings.itemCosts.healthPoints.toString()
		this.getElement("#bottle-buy").innerText = Settings.itemCosts.bottles.toString()
	}

	public static updateCountDown(secondsLeft: number): void {
		const countDownElement = Util.getElement("#countdown span")
		const text = secondsLeft > 0 ? secondsLeft.toString() : "GO!"
		Util.addAnimationClass(countDownElement, "active")
		countDownElement.innerText = text
		const countDownSound = secondsLeft > 0 ? "Countdown" : "Countdown_go"
		SoundManager.getSound(countDownSound)?.playOnce()
	}

	public static statusBarError(type: keyof statusBars): void {
		console.trace()
		Util.addAnimationClass(this.statusBars[type], "error")
	}
}
