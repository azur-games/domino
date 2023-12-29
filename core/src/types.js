/** @typedef {(0|1|2|3|4|5|6)} PieceValue */

/** @type {PieceValue[]} */
export const PieceValues =  Object.freeze([
  /** @type {PieceValue} */ 0,
  /** @type {PieceValue} */ 1,
  /** @type {PieceValue} */ 2,
  /** @type {PieceValue} */ 3,
  /** @type {PieceValue} */ 4,
  /** @type {PieceValue} */ 5,
  /** @type {PieceValue} */ 6,
]);

/** 
* @typedef {{
*  id: integer,
*  side: PlayerSide,
*  name: string,
*  icon: string
* }} PlayerInfo
*/

/** 
 * @typedef {{
 *  action: "move",
 *  piece: [PieceValue, PieceValue],
 *  joint: (null|{piece: [PieceValue, PieceValue], value: PieceValue, additional: boolean})
 * }|{action:"pass"}} Move 
 */

/** @typedef {('workSet'|'unused'|'played')} PlaceType */
export const PlaceTypes = Object.freeze({
  WORKSET:'workSet',
  UNUSED: 'unused',
  PLAYED: 'played'
});

/** @typedef {('distribution' | 'playing' | 'scoring' | 'end')} Phase */
export const Phases = Object.freeze({
  DISTRIBUTION: 'distribution',
  PLAYING: 'playing',
  SCORING: 'scoring',
  END: 'end'
});

/** @typedef {('pass'|'showHighest')} MsgType */
export const MsgTypeDict = Object.freeze({
  PASS:/** @type {MsgType} */ 'pass',
  SHOW_HIGHEST:/** @type {MsgType} */ 'showHighest'
});

export default {};