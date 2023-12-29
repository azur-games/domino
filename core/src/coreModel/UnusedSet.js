/** @deprecated */
import {Place} from "./Place";
import {Card} from "./Piece";
import { PlaceTypes } from "../types";


export class UnusedSet extends Place {
  /** @type {import("../types").PlaceType} */
  get name() {
    return PlaceTypes.UNUSED;
  }

  shuffle() {
    this.sort(c => Math.random());
  }
  /**
   * 
   * @param {function(Card):number} by 
   */
  sort(by) {
    this.pieces
      .map((v) => ({ v, r : by(v) }))
      .sort((e1, e2) => e1.r - e2.r)
      .forEach((e, i) => {
        e.v.order = i;
        e.v.shuffleOrder = i;
      });
  }
}