/** @deprecated */
import { TypedEvent0 } from "../utils/emmiterUtils";
import events from "eventemitter3";

/**
 * Fires start, complete, cancel
 */
export class PlayerTimer extends events.EventEmitter {
  /** @type {any} @private */
  _tid;

  /** @type {number} @private */
  _startTimeMs;

  /** @type {number} @private */
  _endTimeMs;

  /** @readonly @type {TypedEvent0} */
  eventComplete = new TypedEvent0(this, "complete");

  /** @readonly @type {TypedEvent0} */
  eventSchedule = new TypedEvent0(this, "schedule");

  /** @readonly @type {TypedEvent0} */
  eventCancel = new TypedEvent0(this, "cancel");

  /**
   * @type {number}
   * @readonly
   */
  get startDelay() {
    return this._startTimeMs - new Date().getTime();
  }

  /**
   * @type {number}
   * @readonly
   */
  get endDelay() {
    return this._endTimeMs - new Date().getTime();
  }

  /**
   * @type {number}
   * @readonly
   */
  get duration() {
    return this._endTimeMs - this._startTimeMs;
  }

  /**
   * @param {number} duration
   */
  schedule(duration) {
    this.cancel();
    this._startTimeMs = new Date().getTime();
    this._endTimeMs = this._startTimeMs + duration;
    //console.log("delay", delay, duration);
    this._tid = setTimeout(() => this._end(), this.endDelay);
    this.eventSchedule.emit();
    // console.log("timer schedule")
  }
  _end() {
    // this.schedule(this.delay, this.duration); // robustness 
    this.eventComplete.emit();
    // console.log("timer complete");
  }

  cancel() {
    if (this._tid != null) {
      clearTimeout(this._tid);
      this._tid = null;
      this._startTimeMs = 0;
      this._endTimeMs = 0;
      this.eventCancel.emit();
      // console.log("timer cancel");
    }
  }
}