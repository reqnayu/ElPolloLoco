import { MESSAGER } from "../../script.js"

export class Timer implements timerOrIntervalParams {
	private timerId?: number
	handler
	timeout
	isPausable
	private timeRemaining
	private startTime = 0
	private done = false
	private abortController = new AbortController()

	constructor({ handler, timeout, isPausable = true }: timerParams) {
		this.handler = handler
		this.timeout = timeout
		this.isPausable = isPausable
		this.timeRemaining = timeout
		MESSAGER.dispatch("timerManager").addTimer(this)
	}

	pause(): void {
		if (this.done || !this.timerId) return
		clearTimeout(this.timerId)
		this.timerId = undefined
		this.timeRemaining = this.startTime + this.timeout - Date.now()
		// console.log(this.timeRemaining, "pausing timer")
	}

	resume(): this {
		if (this.done || this.timerId) return this
		this.startTime = Date.now()
		this.timerId = setTimeout(() => {
			this.handler()
			this.dispose()
		}, this.timeRemaining)
		if (this.timeRemaining === this.timeout) return this
		return this
		// console.log(`resuming... time remaining: ${this.timeRemaining}s`)
	}

	toggle(): void {
		this.timerId ? this.pause() : this.resume()
	}

	reset(): void {
		clearTimeout(this.timerId)
		this.timerId = undefined
		this.done = false
		this.timeRemaining = this.timeout
	}

	dispose(): void {
		this.done = true
		this.abortController.abort()
	}

	kill(): void {
		this.reset()
		this.dispose()
	}
}

type timerParams = timerOrIntervalParams & {}

export type timerOrIntervalParams = {
	handler(): void
	timeout: number
	isPausable?: boolean
}
