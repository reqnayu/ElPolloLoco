import TimerManager from "../managers/timer.manager.js"
import Timer from "./timer.module.js"

export default class Interval {
	private handler
	private timeout
	private intervalId?: number
	private timeOfLastExecution = 0
	private timeToNextExecution
	private timerToNextExecution?: Timer
	private abortController = new AbortController()
	private stopCallback?(): void
	private stopConditionCallback?(): boolean
	private isPausable = false

	constructor(handler: () => void, timeout: number)
	constructor(handler: () => void, timeout: number, isPauseable: boolean)
	constructor(handler: () => void, timeout: number, stopConditionCallback: () => boolean, stopCallback: () => void)
	constructor(
		handler: () => void,
		timeout: number,
		isPauseableOrStopConditionCallback?: (() => boolean) | boolean,
		stopCallback?: () => void
	) {
		this.handler = handler
		this.timeout = timeout
		this.timeToNextExecution = timeout
		if (typeof isPauseableOrStopConditionCallback === "boolean")
			this.isPausable = isPauseableOrStopConditionCallback
		else if (isPauseableOrStopConditionCallback !== undefined)
			this.stopConditionCallback = isPauseableOrStopConditionCallback
		if (stopCallback !== undefined) this.stopCallback = stopCallback
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
		this.intervalId = undefined

		const now = Date.now()
		this.timeToNextExecution = this.timeout - (now - this.timeOfLastExecution)
	}

	resume(): this {
		if (this.intervalId) return this
		if (!this.timeToNextExecution) return this.start()

		this.timerToNextExecution = new Timer(
			() => {
				this.start()
				this.timerToNextExecution?.dispose()
				this.timerToNextExecution = undefined
			},
			this.timeToNextExecution,
			this.isPausable
		)
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
