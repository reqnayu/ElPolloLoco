import { MESSAGER } from "../../script.js"
import { throttle } from "../util/general.util.js"

export class Renderer {
	ctx
	constructor(private canvas: HTMLCanvasElement) {
		this.ctx = this.canvas.getContext("2d")!
		this.updateDimensions()
		window.addEventListener(
			"resize",
			throttle(() => {
				this.updateDimensions()
			}, MESSAGER.dispatch("main").frameRate)
		)
	}

	updateDimensions() {
		const { innerWidth, innerHeight } = window
		const isDependantOnWidth = innerWidth / innerHeight < 16 / 9
		this.canvas.width = (isDependantOnWidth ? innerWidth : (innerHeight * 16) / 9) * 0.8
		this.canvas.height = (isDependantOnWidth ? (innerWidth * 9) / 16 : innerHeight) * 0.8
	}

	wipe() {
		const { width, height } = this.canvas
		this.ctx.clearRect(0, 0, width, height)
	}
}
