/** @typedef {(import('events').EventEmitter|import('eventemitter3').EventEmitter)} Emitter */

import { ignoreErrorWrap } from './funcUtils';

/** 
 * @template {(...args:any[]) => any} H
 */
export class TypedEvent {

  /**
   * @type {Emitter}
   * @private
   */
  _src;

  /**
   * @type {string}
   * @private
   */
  _event;

  /**
   * @param {Emitter} src 
   * @param {string} event 
   */
  constructor(src, event) {
    this._src = src;
    this._event = event;
  }

  emit(...args) {
    this._src.emit(this._event, ...args);
  }

  /**
   * @param {H} handler
   * @param {object} thisArg `
   */
  on(handler, thisArg=undefined) {
    this._src.on(this._event, handler, thisArg);
  }

  /**
   * Beware! It creates a wrap. Off won't work!
   *
   * @param {H} handler
   * @param {object} thisArg `
   */
  safeOn(handler, thisArg=undefined) {
    this.on(ignoreErrorWrap(handler), thisArg);
  }

  /**
   * @param {H} handler 
   * @param {object} thisArg
   */
  off(handler, thisArg=undefined) {
    this._src.off(this._event, handler, thisArg);
  }

  /**
   * Beware! It creates a wrap. Off won't work!
   *
   * @param {H} handler
   * @param {object} thisArg 
   */
  once(handler, thisArg=undefined) {
    this._src.once(this._event, handler, thisArg);
  }

  /**
   * @param {H} handler
   * @param {object} thisArg `
   */
  safeOnce(handler, thisArg=undefined) {
    this.once(ignoreErrorWrap(handler), thisArg);
  }

  /** @param {{ handler: H, thisArg?: object, offSrc: (Emitter|TypedEvent), offEvent?: string }} param0 */
  onAndOff({handler, thisArg, offSrc, offEvent}) {
    this._src.on(this._event, handler, thisArg);
    if(offSrc instanceof TypedEvent) {
      offSrc.once(() => this._src.off(this._event, handler, thisArg));
    } else {
      offSrc.once(offEvent, () => this._src.off(this._event, handler, thisArg));
    }
  }

  /** @param {{ handler: H, thisArg?: object, offSrc: (Emitter|TypedEvent), offEvent?: string }} param0 */
  safeOnAndOff({handler, thisArg, offSrc, offEvent}) {
    this.onAndOff({handler:ignoreErrorWrap(handler), thisArg, offSrc, offEvent})
  }

  /**
   * By default EventEmitters will print a warning if more than 10 listeners are added for a particular event.
   * This is a useful default that helps finding memory leaks. The emitter.setMaxListeners() method allows the
   * limit to be modified for this specific EventEmitter instance. The value can be set toInfinity (or 0) to indicate an unlimited number of listeners.
   * 
   * @param {number} value 
   */
  setMaxListeners(value) {
    if (this._src.setMaxListeners) this._src.setMaxListeners(value)
  }
}


/**
 * @extends {TypedEvent<() => any>}
 */
 export class TypedEvent0 extends TypedEvent {
  emit() {
    super.emit();
  }
}

/**
 * @template P1
 * @extends {TypedEvent<(arg0: P1) => any>}
 */
export class TypedEvent1 extends TypedEvent {
  /** @param {P1} p1 */
  emit(p1) {
    super.emit(p1);
  }
}

/**
 * @template P1, P2
 * @extends {TypedEvent<(arg0: P1, arg1: P2) => any>}
 */
 export class TypedEvent2 extends TypedEvent {
  /** 
   * @param {P1} p1 
   * @param {P2} p2 
   */
  emit(p1, p2) {
    super.emit(p1, p2);
  }
}

/**
 * @template P1, P2, P3
 * @extends {TypedEvent<(arg0: P1, arg1: P2, arg2: P3) => any>}
 */
export class TypedEvent3 extends TypedEvent {
  /** 
   * @param {P1} p1 
   * @param {P2} p2 
   * @param {P3} p3
   */
  emit(p1, p2, p3) {
    super.emit(p1, p2, p3);
  }
}

/**
 * @template P1, P2, P3, P4
 * @extends {TypedEvent<(arg0: P1, arg1: P2, arg2: P3, arg3: P4) => any>}
 */
export class TypedEvent4 extends TypedEvent {
  /** 
   * @param {P1} p1 
   * @param {P2} p2 
   * @param {P3} p3
   * @param {P4} p4
   */
  emit(p1, p2, p3, p4) {
    super.emit(p1, p2, p3, p4);
  }
}

/**
 * Beware! It creates a wrap. Off won't work!
 *
 * @param {Emitter} onSrc
 * @param {string} onEvent
 * @param {(...args: any[]) => void} handler
 * @param {object} thisArg `
 */
export const safeOn = (onSrc, onEvent, handler, thisArg=undefined) => {
  onSrc.on(onEvent, ignoreErrorWrap(handler), thisArg);
}

/** @param {{onSrc: Emitter, onEvent: string, handler: (...args: any[]) => void, thisArg: object, offSrc: Emitter, offEvent: string}} param0 */
export const onAndOff = ({onSrc, onEvent, handler, thisArg, offSrc, offEvent}) => {
  onSrc.on(onEvent, handler, thisArg);
  offSrc.once(offEvent, () => onSrc.off(onEvent, handler, thisArg));
}

/** @param {{onSrc: Emitter, onEvent: string, handler: (...args: any[]) => void, thisArg: object, offSrc: Emitter, offEvent: string}} param0 */
export const safeOnAndOff = ({onSrc, onEvent, handler, thisArg, offSrc, offEvent}) => {
  onAndOff({onSrc, onEvent, handler: ignoreErrorWrap(handler), thisArg, offSrc, offEvent});
}

