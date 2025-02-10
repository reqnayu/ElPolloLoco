import TimerManager from "../managers/timer.manager.js"

/**
 * The Timer class is used to manage a countdown timer with the ability to pause, resume, reset, and dispose.
 * The timer can execute a handler function once the timeout period has elapsed.
 */
export default class Timer {
  /** The ID of the timer instance, used to cancel the timer */
  private timerId?: number

  /** The handler function to be called when the timer reaches its timeout */
  private handler

  /** The timeout value in milliseconds */
  private timeout

  /** The time remaining on the timer, used when pausing/resuming */
  private timeRemaining

  /** The start time of the timer when it starts */
  private startTime = 0

  /** Flag indicating whether the timer has finished */
  private done = false

  /** The AbortController instance to abort the timer if needed */
  private abortController = new AbortController()

  /**
   * Creates a new Timer instance.
   *
   * @param handler The function to be called when the timer finishes.
   * @param timeout The timeout duration in milliseconds.
   * @param isPausable Optional flag to indicate if the timer is pausable (defaults to true).
   */
  constructor(handler: () => void, timeout: number)
  constructor(handler: () => void, timeout: number, isPausable: boolean)
  constructor(handler: () => void, timeout: number, isPausable?: boolean) {
    this.handler = handler
    this.timeout = timeout
    this.timeRemaining = timeout
    TimerManager.addTimer(this)
  }

  /**
   * Pauses the timer, saving the time remaining.
   */
  pause(): void {
    if (this.done || !this.timerId) return
    clearTimeout(this.timerId)
    this.timerId = undefined
    this.timeRemaining = this.startTime + this.timeout - Date.now()
  }

  /**
   * Resumes the timer from where it was paused.
   *
   * @returns The current Timer instance for method chaining.
   */
  resume(): this {
    if (this.done || this.timerId) return this
    this.startTime = Date.now()
    this.timerId = setTimeout(() => {
      this.handler()
      this.dispose()
    }, this.timeRemaining)
    if (this.timeRemaining === this.timeout) return this
    return this
  }

  /**
   * Toggles between pausing and resuming the timer.
   */
  toggle(): void {
    this.timerId ? this.pause() : this.resume()
  }

  /**
   * Resets the timer to its original timeout value, clearing any ongoing countdown.
   */
  reset(): void {
    clearTimeout(this.timerId)
    this.timerId = undefined
    this.done = false
    this.timeRemaining = this.timeout
  }

  /**
   * Disposes of the timer, marking it as done and aborting any ongoing countdown.
   */
  dispose(): void {
    this.done = true
    this.abortController.abort()
  }

  /**
   * Kills the timer by resetting and disposing of it.
   */
  kill(): void {
    this.reset()
    this.dispose()
  }
}
