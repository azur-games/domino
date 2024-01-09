/** @deprecated */
import { DominoTable } from "./DominoTable";
import { Place } from "./Place";
import * as Types from "../types";
import { PlayerWorkSet } from "./PlayerWorkSet";
import { UserConnector } from "../userModel/UserConnector";

export class Player {
  /** @type {boolean} */
  bot;

  /** @type {boolean} */
  fake;

  /** @type {DominoTable} @readonly */
  table;

  /** @type {PlayerWorkSet} @readonly */
  workSet;

  /** @type {Types.PlayerInfo} */
  data

  /** @type {integer} */
  winScore

  /** @type {integer} */
  moveScore

  /** @type {integer} */
  score

  /**
   * Creates an instance of Player.
   *
   * @param {DominoTable} table
   */
  constructor(table) {
    this.data = {id:0,icon:"",name:""};
    this.bot = false;
    this.fake = false;
    this.table = table;
    this.workSet = new PlayerWorkSet(this);
    this.score = 0;
    this.winScore = 0
    this.moveScore = 0;
  }

  /** @type {Player} */
  get next() {
    return this.table.nextPlayer(this);
  }

  /**
   * @param {Types.Move} move 
   */
  move(move){
    this.table.move(this, move);
  }

  get piecesSumValue() {
    let s = 0;
    for(let p of this.workSet.pieces) {
      s += p.lowValue;
      s += p.highValue;
    }
    return s;
  }
}
