import Interval from "../modules/interval.module.js"
import Timer from "../modules/timer.module.js"

/**
 * TimerManager is responsible for managing and controlling all timers and intervals in the game.
 * It provides methods to pause, resume, toggle, and add timers and intervals globally.
 */
export default abstract class TimerManager {
  /**
   * An array that stores all active timers.
   * @type {Timer[]}
   */
  private static allTimers: Timer[] = []

  /**
   * An array that stores all active intervals.
   * @type {Interval[]}
   */
  private static allIntervals: Interval[] = []

  /**
   * Initializes the TimerManager by setting up event listeners for pausing and resuming timers and intervals.
   * @returns {void}
   */
  public static initialize(): void {
    window.addEventListener("resumegame", () => this.resumeAll())
    window.addEventListener("pausegame", () => this.pauseAll())
  }

  /**
   * Toggles the state (paused/resumed) of all timers and intervals.
   * @returns {void}
   */
  public static toggleAll(): void {
    this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.toggle())
  }

  /**
   * Pauses all active timers and intervals.
   * @returns {void}
   */
  public static pauseAll(): void {
    this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.pause())
  }

  /**
   * Resumes all paused timers and intervals.
   * @returns {void}
   */
  public static resumeAll(): void {
    this.allTimersAndIntervals.forEach((timerOrInterval) => timerOrInterval.resume())
  }

  /**
   * Retrieves a combined list of all active timers and intervals.
   * @private
   * @returns {(Timer | Interval)[]} A list containing all timers and intervals.
   */
  private static get allTimersAndIntervals(): (Timer | Interval)[] {
    return [...this.allTimers, ...this.allIntervals]
  }

  /**
   * Adds a new timer to the list of active timers.
   * @param {Timer} timer - The timer to be added.
   * @returns {void}
   */
  public static addTimer(timer: Timer): void {
    this.allTimers.push(timer)
  }

  /**
   * Adds a new interval to the list of active intervals.
   * @param {Interval} interval - The interval to be added.
   * @returns {void}
   */
  public static addInterval(interval: Interval): void {
    this.allIntervals.push(interval)
  }
}
