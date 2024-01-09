/** @deprecated */
import { PlaceTypes } from "../types";
import { Place } from "./Place";

export class PlayedPlace extends Place {
  /** @type {import("../types").PlaceType} */
  get name() {
    return PlaceTypes.PLAYED;
  }
  
}