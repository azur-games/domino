/** @deprecated */
import { Piece } from "./Piece";

export class Place {
  /** @type {import("./DominoTable").DominoTable} @readonly */
  table;

  /**
   * @param {PreferenceTable} table
   */
  constructor(table) {
    this.table = table;
  }

  /** @type {import("../types").PlaceType} */
  get name() {
    return null;
  }

  /**
   * @type {Piece[]}
   * @readonly
   */
  get pieces() {
    return this.table.pieces
      .filter((c) => c.place == this)
      .sort((c1, c2) => c1.order - c2.order);
  }

  /**
   * @param {Piece} c
   */
  add(c) {
    if (c.place == this) return;
    c.prevPlace = c.place;
    c.place = this;
    c.order = this.pieces.length;
    if(c.prevPlace) {
      c.prevPlace._sort();
    }
    this._sort();
  }

  /** @private */
  _sort() {
    // unsorted
  }

  /**
   * @param {Player} player 
   */
  visibleTo(player) {
    return false;    
  }
}
