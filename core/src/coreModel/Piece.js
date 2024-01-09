import { Place } from "./Place";
import * as Types from "../types";
import { Player } from "./Player";

export class Piece {
  /** @type {[Types.PieceValue, Types.PieceValue]} @readonly */
  values;

  /** @type {Place} Modify only from place!*/
  place;

  /** @type {number} */
  order;

  /** @type {number} */
  shuffleOrder; // for sync

  /** @type {Place} */
  prevPlace;

  /** @type {boolean} */
  shown;

  /** @type {import("./DominoTable").Joint?} */
  joint;

  /**
   * @param {[Types.PieceValue, Types.PieceValue]} values
   * @param {Place} place
   * @param {number} order
   */
  constructor(values, place, order) {
    this.values = values[0] > values[1] ? [values[1], values[0]]: values;
    this.place = place;
    this.order = order;
    this.prevPlace = null;
    this.shown = false;
    this.joint = null;
  }

  get lowValue() {
    return this.values[0];
  }

  get highValue() {
    return this.values[1];
  }

  get isDouble() {
    return this.lowValue == this.highValue;
  }

  get superiority() {
    return this.highValue * Types.PieceValues.length + this.lowValue;
  }

  get suitableTableJoints() {
    return this.place.table.joints.filter(j => this.values.indexOf(j.value) >= 0);
  }

  // not connected side
  get freeValue() {
    if(this.lowValue == this.highValue) {
      return this.values[0];
    }
    return this.values.find(v => v != this.joint?.value);    
  }
}
