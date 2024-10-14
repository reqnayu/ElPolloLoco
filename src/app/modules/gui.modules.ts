import { MESSAGER } from "../../script.js"
import { SoundBehaviour } from "../behaviours/sound.behaviour.js"
import { BehaviourFactory } from "../factories/behaviour.factory.js"
import { Assets } from "../managers/asset_manager.module.js"
import { getAllElements, getElement, pointerEventIsLeftClick } from "../util/general.util.js"
import { SoundAsset } from "./sound_asset.module.js"

@Assets({
	audio: ["gui/ButtonDown.mp3", "gui/ButtonUp.mp3", "gui/Countdown.mp3", "gui/Countdown_go.mp3"]
})
export class Gui {
	soundBehaviour: SoundBehaviour
	buttons: HTMLElement[] = []

	constructor() {
		this.soundBehaviour = BehaviourFactory.create("sound", [
			new SoundAsset("menu", "gui/ButtonDown.mp3", false),
			new SoundAsset("menu", "gui/ButtonUp.mp3", false),
			new SoundAsset("menu", "gui/Countdown.mp3"),
			new SoundAsset("menu", "gui/Countdown_go.mp3")
		])
		this.getButtons()
		this.attachSounds()
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
		countDownElement.classList.add("active")
		countDownElement.innerText = text
		countDownElement.addEventListener("animationend", () => countDownElement.classList.remove("active"), {
			once: true
		})
		const countDownSound = secondsLeft > 0 ? "Countdown" : "Countdown_go"
		MESSAGER.dispatch("soundManager").allAudioElements.get(countDownSound)?.playOnce()
	}
}
