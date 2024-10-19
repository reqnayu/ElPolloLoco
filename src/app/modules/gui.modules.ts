import { MESSAGER } from "../../script.js"
import { SoundBehaviour } from "../behaviours/sound.behaviour.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import {
	addAnimationClass,
	getAllElements,
	getElement,
	pointerEventIsLeftClick,
	roundTo
} from "../util/general.util.js"

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
			hp: getElement("#hp-bar"),
			coin: getElement("#coin-bar"),
			bottle: getElement("#bottle-bar"),
			endbossHp: getElement("#endboss-hp-bar")
		}
		this.getButtons()
		this.attachSounds()
		MESSAGER.elements.set("gui", this)
	}

	async initialize(): Promise<void> {
		this.setUpStatusBars()
		await this.soundBehaviour.fadeOut("Menu", 1000)
		this.soundBehaviour.playLooped("Game")
	}

	private setUpStatusBars(): void {
		Object.keys(this.statusBars).forEach((type) => {
			const maxAmount = MESSAGER.dispatch("main").settings.resources[type as keyof statusBars]
			this.updateStatusBar(type as keyof statusBars, type === "coin" ? 0 : maxAmount, maxAmount)
		})
	}

	updateStatusBar(type: keyof statusBars, currentAmount: number, maxAmount: number): void {
		const roundedPercent = roundTo(currentAmount / maxAmount, 2)
		this.statusBars[type].style.setProperty("--value", roundedPercent.toString())
		this.statusBars[type].getElement(".current-amount").innerHTML = currentAmount.toString()
		this.statusBars[type].getElement(".max-amount").innerHTML = maxAmount.toString()
		if (currentAmount === maxAmount) return
		switch (type) {
			case "hp":
			case "endbossHp":
				this.statusBarError(type)
		}
	}

	private getButtons(): void {
		this.buttons = getAllElements("#game button, input[type='checkbox']")
	}

	private attachSounds(): void {
		const soundManager = MESSAGER.dispatch("soundManager")
		const buttonDownSound = this.soundBehaviour.getSound("ButtonDown")
		const buttonUpSound = this.soundBehaviour.getSound("ButtonUp")
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

export type statusBars = {
	hp: HTMLElement
	coin: HTMLElement
	bottle: HTMLElement
	endbossHp: HTMLElement
}
