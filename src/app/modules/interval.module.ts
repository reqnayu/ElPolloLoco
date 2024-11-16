import { TimerManager } from "../managers/timer.manager.js"
import { Timer, timerOrIntervalParams } from "./timer.module.js"

export class Interval implements intervalParams {
	handler
	timeout
	private intervalId?: number
	private timeOfLastExecution = 0
	private timeToNextExecution
	private timerToNextExecution?: Timer
	private abortController = new AbortController()
	stopCallback?(): void
	stopConditionCallback?(): boolean
	pauseCallback?(): void
	isPausable

	constructor({
		handler,
		timeout,
		pauseCallback,
		stopCallback,
		stopConditionCallback,
		isPausable = true
	}: intervalParams) {
		this.handler = handler
		this.timeout = timeout
		this.pauseCallback = pauseCallback
		this.stopCallback = stopCallback
		this.stopConditionCallback = stopConditionCallback
		this.isPausable = isPausable
		this.timeToNextExecution = timeout
		window.addEventListener("error", () => this.dispose())
		TimerManager.addInterval(this)
	}

	private start(): this {
		if (this.intervalId !== undefined) return this
		this.timeOfLastExecution = Date.now()
		this.intervalId = setInterval(() => {
			this.timeOfLastExecution = Date.now()
			this.handler()
			if (this.stopConditionCallback?.()) this.dispose()
		}, this.timeout)
		return this
	}

	pause(): void {
		if (!this.intervalId || !this.isPausable) return
		clearInterval(this.intervalId)
		this.pauseCallback?.()
		this.intervalId = undefined

		const now = Date.now()
		this.timeToNextExecution = this.timeout - (now - this.timeOfLastExecution)
	}

	resume(): this {
		if (this.intervalId) return this
		if (!this.timeToNextExecution) return this.start()

		this.timerToNextExecution = new Timer({
			handler: () => {
				this.start()
				this.timerToNextExecution?.dispose()
				this.timerToNextExecution = undefined
			},
			timeout: this.timeToNextExecution,
			isPausable: this.isPausable
		})
		this.timerToNextExecution.resume()
		return this
	}

	toggle(): void {
		this.intervalId ? this.pause() : this.resume()
	}

	dispose(): void {
		if (!this.intervalId) return
		this.stopCallback?.()
		clearInterval(this.intervalId)
		this.intervalId = undefined
		this.timerToNextExecution?.dispose()
		this.abortController.abort()
	}
}

type intervalParams = timerOrIntervalParams & {
	pauseOnGamePause?: boolean
	stopCallback?(): void
	stopConditionCallback?(): boolean
	pauseCallback?(): void
}
