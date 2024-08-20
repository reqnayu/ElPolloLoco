import { Timer } from "./timer.module.js"

export class Interval {
	private handler
	private timeout
	private intervalId?: number
	private timeOfLastExecution = 0
	private timeToNextExecution
	private timerToNextExecution?: Timer
	private abortController = new AbortController()
	private stopConditionCallback?(): boolean

	constructor({ handler, timeout, pauseOnGamePause, stopConditionCallback }: IntervalParams) {
		this.handler = handler
		this.timeout = timeout
		this.stopConditionCallback = stopConditionCallback
		this.timeToNextExecution = timeout
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
			if (this.stopConditionCallback?.() === true) {
				return this.dispose()
			}
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

type IntervalParams = {
	handler(): void
	timeout: number
	pauseOnGamePause?: boolean
	stopConditionCallback?(): boolean
}
