/** @deprecated */
import { type } from "os";
import {Player} from "./Player";
import { Place } from "./Place";
import { PlaceTypes } from "../types";

export class PlayerWorkSet extends Place {

  /** @type {Player} @readonly */
  player;

  constructor(/** @type {Player} */player) {
    super(player.table);
    this.player = player;
  }

  /** @type {import("../types").PlaceType} */
  get name() {
    return PlaceTypes.WORKSET;
  }

  get movablePieces() {
    if(this.table.joints.length == 0) {
      this.pieces;
    }
    return this.pieces.filter(i => i.suitableTableJoints.length > 0);
  }

  /** @private */
  _sort() {
    const sortedPieces = this.pieces.sort((a,b)=>a.superiority - b.superiority);
    for(let i = 0; i < sortedPieces.length; i++) {
      sortedPieces[i].order = i;
    }
  }

  sort() {
    this._sort();
  }

}