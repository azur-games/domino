import {EventEmitter} from 'eventemitter3';
import { RankValues, SuitValues } from '../types';
import { TypedEvent, TypedEvent0, TypedEvent2 } from '../utils/emmiterUtils';
import * as types from '../types';

/**
 * @typedef {{
 *  values: [integer, integer],
 *  open: boolean,
 *  side: types.PlayerSide,
 *  place: types.PlaceType,
 *  shown: boolean,
 *  joint: {piece:[integer, integer], additional: boolean, value: Types.PieceValue},
 *  order: integer,
 *  pos: [number, number],
 *  rot: import('../coreModel/PiecesLayout').PieceDirection
 * }} PieceDto
 */

/** 
  * @typedef {types.PlayerInfo & {
  *  side: PlayerSide,
  *  moveScore: integer,
  *  winScore: integer,
  *  score: integer,
  * }} PlayerInfoDto
  */

/** 
 * @typedef {{
 *  pieces: PieceDto[],
 *  phase: types.Phase,
 *  turn: types.PlayerSide,
 *  possibleMoves: types.Move[],
 *  targetScore: integer;
 *  minScore: integer;
 *  syncDelayMillis: integer,
 *  timerEndDelayMillis: integer,
 *  timerDurationMillis: integer,
 *  players:  Object<types.PlayerSide,  types.PlayerInfoDto>
 * }} TableDto
 */

export class UserTable extends EventEmitter {

  /** @type {TableDto} */
  state = {players:{},pieces:[], possibleMoves:[]}

  /** @private @type {Date} */
  _timerEnd = null

  /** @readonly @type {TypedEvent0} */
  eventUpdated = new TypedEvent0(this, "updated");

  /** @readonly @type {TypedEvent2<import('../types').PlayerSide, types.MessageDto>} */
  eventPhrase = new TypedEvent2(this, "phrase");

  /** @private @type {import('eventemitter3').EventEmitter} */
  _connection

  constructor() {
    super();
    this.onState = this.onState.bind(this);
    this.onPhrase = this.onPhrase.bind(this);
  }

  set connection(v){
    if(this._connection == v) return;
    if(this._connection) {
      this._connection.off('state', this.onState);
      this._connection.off('phrase', this.onPhrase);
    }
    this._connection = v;
    if(this._connection) {
      this._connection.on('state', this.onState);
      this._connection.on('phrase', this.onPhrase);
      this._connection.emit('sync');
    }
  }

  get connection() {
    return this._connection;
  }

  /** @private */
  onPhrase(p, msg) {
    this.eventPhrase.emit(p, msg);
  }

  /** @readonly */
  get timerEnd() {
    return this._timerEnd;
  }

  /** 
   * @private
   * @param {TableDto} dto
   */
  onState(dto){
    this.state = dto;
    this._timerEnd = dto.timerEndDelayMillis ? new Date(Date.now() + dto.timerEndDelayMillis) : null;
    this.eventUpdated.emit();
  }

  move(/** @type {import('../types').Move} */m) {
    if(this._connection) {
      this._connection.emit("move", m);
    }
  }

}
