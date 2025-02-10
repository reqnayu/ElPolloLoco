import TimerManager from "../managers/timer.manager.js"
import Timer from "./timer.module.js"

/**
 * The Interval class allows for managing intervals with start, pause, resume, and dispose functionality.
 * It also supports conditions to stop the interval and handles pausing/resuming the interval on demand.
 */
export default class Interval {
  private handler: () => void
  private timeout: number
  private intervalId?: number
  private timeOfLastExecution = 0
  private timeToNextExecution: number
  private timerToNextExecution?: Timer
  private abortController = new AbortController()
  private stopCallback?(): void
  private stopConditionCallback?(): boolean
  private isPausable = false

  /**
   * Creates a new Interval instance with various configuration options.
   *
   * @param handler The function to execute at each interval.
   * @param timeout The duration in milliseconds between each execution of the handler function.
   * @param isPauseableOrStopConditionCallback Optionally specifies whether the interval can be paused or provides a stop condition function.
   * @param stopCallback Optionally specifies a callback to execute when the interval is stopped.
   */
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

  /**
   * Starts the interval, which repeatedly executes the handler function at the specified timeout.
   * If a stop condition is provided, the interval will stop when the condition is met.
   *
   * @returns The Interval instance for method chaining.
   */
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

  /**
   * Pauses the interval execution, retaining the time remaining until the next execution.
   * Can only pause if the interval is pausable.
   */
  pause(): void {
    if (!this.intervalId || !this.isPausable) return
    clearInterval(this.intervalId)
    this.intervalId = undefined

    const now = Date.now()
    this.timeToNextExecution = this.timeout - (now - this.timeOfLastExecution)
  }

  /**
   * Resumes the interval execution, starting from where it was paused, or immediately if not paused before.
   *
   * @returns The Interval instance for method chaining.
   */
  resume(): this {
    if (this.intervalId) return this
    if (!this.timeToNextExecution) return this.start()

    // Use a Timer to delay the resumption of the interval based on the remaining time
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

  /**
   * Toggles the interval between paused and resumed states.
   */
  toggle(): void {
    this.intervalId ? this.pause() : this.resume()
  }

  /**
   * Disposes of the interval, stopping the execution and clearing all associated resources.
   * Executes the stop callback if provided.
   */
  dispose(): void {
    if (!this.intervalId) return
    this.stopCallback?.()
    clearInterval(this.intervalId)
    this.intervalId = undefined
    this.timerToNextExecution?.dispose()
    this.abortController.abort()
  }
}
