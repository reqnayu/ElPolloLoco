import { MESSAGER } from "../../script.js"
import { SoundBehaviour } from "../behaviours/sound.behaviour.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets, getAsset } from "../managers/asset_manager.module.js"
import {
	addAnimationClass,
	getAllElements,
	getElement,
	pointerEventIsLeftClick,
	roundTo
} from "../util/general.util.js"
import { SoundAsset } from "./sound_asset.module.js"

@Assets({
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
export class Gui {
	soundBehaviour: SoundBehaviour
	private buttons: HTMLElement[] = []
	private statusBars: statusBars

	constructor() {
		this.soundBehaviour = BehaviourFactory.create("sound", [
			new SoundAsset("menu", "gui/ButtonDown.mp3", false),
			new SoundAsset("menu", "gui/ButtonUp.mp3", false),
			new SoundAsset("menu", "gui/Countdown.mp3"),
			new SoundAsset("menu", "gui/Countdown_go.mp3"),
			new SoundAsset("music", "gui/Menu.mp3", false),
			new SoundAsset("music", "gui/Game.mp3", false)
		])
		this.statusBars = {
			hp: getElement("#hp-bar"),
			coin: getElement("#coin-bar"),
			bottle: getElement("#bottle-bar")
		}
		this.getButtons()
		this.attachSounds()
	}

	async initialize(): Promise<void> {
		this.setUpStatusBars()
		await this.soundBehaviour.sounds.get("Menu")?.fadeOut(1000)
		this.soundBehaviour.playLooped("Game")
	}

	private setUpStatusBars(): void {
		Object.keys(this.statusBars).forEach((type) =>
			this.updateStatusBar(type as keyof statusBars, type === "coin" ? 0 : 1)
		)
	}

	updateStatusBar(type: keyof statusBars, fraction: number): void {
		const typeSrc =
			type === "hp"
				? "2_statusbar_health/green"
				: type === "coin"
				? "1_statusbar_coin/blue"
				: "3_statusbar_bottle/orange"
		const roundedPercent = roundTo((fraction * 100) / 5) * 5
		this.statusBars[type]
			.getElement<HTMLImageElement>("img")
			.replaceWith(getAsset(`7_statusbars/1_statusbar/${typeSrc}/${roundedPercent}.png`))
	}

	private getButtons(): void {
		this.buttons = getAllElements("#game button, input[type='checkbox']")
	}

	private attachSounds(): void {
		const soundManager = MESSAGER.dispatch("soundManager")
		const buttonDownSound = soundManager.allAudioElements.get("ButtonDown")
		const buttonUpSound = soundManager.allAudioElements.get("ButtonUp")
		this.buttons
			.filter((btn) => !btn.classList.contains("no-sound"))
			.forEach((btn) => {
				btn.addEventListener("pointerdown", (e) => {
					if (!pointerEventIsLeftClick(e)) return
					buttonDownSound?.playOnce()
					btn.addEventListener(
						"pointerup",
						(e) => {
							if (!pointerEventIsLeftClick(e)) return
							buttonUpSound?.playOnce()
						},
						{ once: true }
					)
				})
			})
	}

	updateCountDown(secondsLeft: number): void {
		const countDownElement = getElement("#countdown span")
		const text = secondsLeft > 0 ? secondsLeft.toString() : "GO!"
		addAnimationClass(countDownElement, "active")
		countDownElement.innerText = text
		const countDownSound = secondsLeft > 0 ? "Countdown" : "Countdown_go"
		MESSAGER.dispatch("soundManager").allAudioElements.get(countDownSound)?.playOnce()
	}

	statusBarError(type: keyof statusBars): void {
		addAnimationClass(this.statusBars[type], "error")
	}
}

type statusBars = {
	hp: HTMLElement
	coin: HTMLElement
	bottle: HTMLElement
}
