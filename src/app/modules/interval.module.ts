import { Timer } from "./timer.module.js"

export class Interval {
	private intervalId?: number
	private timeOfLastExecution = 0
	private timeToNextExecution = this.timeout
	private timerToNextExecution?: Timer
	private abortController = new AbortController()

	constructor(public handler: () => void, public timeout: number, pauseOnGamePause: boolean = true) {
		if (pauseOnGamePause === true) {
			window.addEventListener("resumegame", () => this.resume(), {
				signal: this.abortController.signal
			})
			window.addEventListener("pausegame", () => this.pause(), {
				signal: this.abortController.signal
			})
		}
		window.addEventListener("error", () => this.dispose())
	}

	private start(): void {
		if (this.intervalId !== undefined) return
		this.timeOfLastExecution = Date.now()
		this.intervalId = setInterval(() => {
			this.timeOfLastExecution = Date.now()
			this.handler()
		}, this.timeout)
	}

	pause(): void {
		if (!this.intervalId) return
		clearInterval(this.intervalId)
		this.intervalId = undefined

		const now = Date.now()
		this.timeToNextExecution = this.timeout - (now - this.timeOfLastExecution)
	}

	resume(): void {
		if (this.intervalId) return
		if (!this.timeToNextExecution) return this.start()

		this.timerToNextExecution = new Timer(() => {
			this.start()
			this.timerToNextExecution?.dispose()
			this.timerToNextExecution = undefined
		}, this.timeToNextExecution)
		this.timerToNextExecution.resume()
	}

	toggle(): void {
		this.intervalId ? this.pause() : this.resume()
	}

	dispose(): void {
		if (!this.intervalId) return
		clearInterval(this.intervalId)
		this.intervalId = undefined
		this.timerToNextExecution?.dispose()
		this.abortController.abort()
	}
}
