import { DominoTable } from "./DominoTable";
import { Piece } from "./Piece";

/** @typedef {('right'|'down'|'left'|'up')} PieceDirection */
const PieceDirections = Object.freeze({
  right: /** @type {PieceDirection} */ "right",
  down: /** @type {PieceDirection} */ "down",
  left: /** @type {PieceDirection} */ "left",
  up: /** @type {PieceDirection} */ "up",
});

const InversePieceDirections = {
  [PieceDirections.left]: PieceDirections.right,
  [PieceDirections.right]: PieceDirections.left,
  [PieceDirections.up]: PieceDirections.down,
  [PieceDirections.down]: PieceDirections.up,
}

/**
 * @typedef {{
 *   pos: [integer, integer],
 *   rot: PieceDirection,
 *   moveDir: PieceDirection,
 *   piece: Piece
 * }} PiecePosition 
 */

const usedOffsHor = [
  [-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5], [1.5, 0.5], 
  [-1.5, -0.5], [-0.5, -0.5], [0.5, -0.5], [1.5, -0.5],
];

const usedOffsVer = [
  [-0.5, 1.5], [0.5, 1.5], 
  [-0.5, 0.5], [0.5, 0.5], 
  [-0.5, -0.5], [0.5, -0.5], 
  [-0.5, -1.5], [0.5, -1.5],
];

export class PiecesLayout {
  used = {}
  /** @type {PiecePosition[]} */
  positions = []


  /** @readonly */
  table 

  constructor(/** @type {DominoTable} */ table) {
    this.table = table
  }

  reset() {
    this.usedCells = {}
    this.positions = []
  }

  add(/** @type {Piece} */p) {
    let usedOffs = null;
    /** @type {PiecePosition} */
    let pp = null;
    /** @type {PiecePosition} */
    const prevPiecePos = this.positions.find(pr => pr.piece == p.joint?.piece);
    if(prevPiecePos == null) {
      if(p.isDouble) {
        pp = {
          pos: [0,0],
          moveDir: null,
          rot: PieceDirections.down, 
          piece: p
        };
        usedOffs = usedOffsVer;
      } else {
        pp = {
          pos: [0,0],
          moveDir: null,
          rot: PieceDirections.right,
          piece: p,
        };
        usedOffs = usedOffsHor;
      }
    } else {
      if(p.joint.piece == this.table.pivot) {       
        // p can't be double
        if(p.joint.additional == false) {    
          usedOffs = usedOffsHor;      
          // try to place to the right          
          if(this.positions.find(ppp=> ppp.piece.joint?.piece == prevPiecePos.piece 
            && ppp.piece.joint?.value == prevPiecePos.piece.values[1]
            && ppp.piece.joint?.additional == false) == null) {
            pp = {
              pos: [prevPiecePos.pos[0] + 1.5, prevPiecePos.pos[1]],
              moveDir: PieceDirections.right,
              rot: p.joint.value == p.lowValue ? PieceDirections.right : PieceDirections.left,
              piece: p
            }
          } else {
            pp = {
              pos: [prevPiecePos.pos[0] - 1.5, prevPiecePos.pos[1]],
              moveDir: PieceDirections.left,
              rot: p.joint.value == p.lowValue ? PieceDirections.left : PieceDirections.right,
              piece: p
            }
          }
        } else {
          usedOffs = usedOffsVer;
          if(this.positions.find(ppp=> ppp.piece.joint?.piece == prevPiecePos.piece 
            && ppp.piece.joint?.value == prevPiecePos.piece.values[1]
            && ppp.piece.joint?.additional == true) == null) {
            pp = {
              pos: [prevPiecePos.pos[0], prevPiecePos.pos[1] + 2],
              moveDir: PieceDirections.up,
              rot: p.joint.value == p.lowValue ? PieceDirections.up : PieceDirections.down,
              piece: p
            }
          } else {
            pp = {
              pos: [prevPiecePos.pos[0], prevPiecePos.pos[1] - 2],
              moveDir: PieceDirections.down,
              rot: p.joint.value == p.lowValue ? PieceDirections.down : PieceDirections.up,
              piece: p
            }
          }
        }
      } else {
        let moveDir = prevPiecePos.moveDir;
        if(moveDir == null) {
          if(p.joint.value == prevPiecePos.piece.values[1]
            && this.positions.find(
              ppp=>ppp.piece.joint?.piece == prevPiecePos.piece 
              && ppp.piece.joint?.value == prevPiecePos.piece.values[1]
              && ppp.piece.joint?.additional == false
            )==null) {
              moveDir = PieceDirections.right;
            } else {
              moveDir = PieceDirections.left;
            }
        }
        usedOffs = p.isDouble ? usedOffsVer : usedOffsHor;
        if(moveDir == PieceDirections.right) {         
          pp = {
            pos: [prevPiecePos.pos[0] + ((p.isDouble || p.joint.piece.isDouble) ? 1.5 : 2), prevPiecePos.pos[1]],
            moveDir: PieceDirections.right,
            rot: p.isDouble ? PieceDirections.down : p.joint.value == p.lowValue ? PieceDirections.right : PieceDirections.left,
            piece: p
          };
        } else if (moveDir == PieceDirections.left) {
          pp = {
            pos: [prevPiecePos.pos[0] - ((p.isDouble || p.joint.piece.isDouble) ? 1.5 : 2), prevPiecePos.pos[1]],
            moveDir: PieceDirections.left,
            rot: p.isDouble ? PieceDirections.down : p.joint.value == p.lowValue ? PieceDirections.left : PieceDirections.right,
            piece: p
          };
        } else if (moveDir == PieceDirections.up) {
          pp = {
            pos: [prevPiecePos.pos[0] + (p.isDouble ? 1 : 1.5) , prevPiecePos.pos[1] + 0.5],
            moveDir: PieceDirections.right,
            rot: p.isDouble ? PieceDirections.down : p.joint.value == p.lowValue ? PieceDirections.right : PieceDirections.left,
            piece: p
          };
        } else if (moveDir == PieceDirections.down) {
          pp = {
            pos: [prevPiecePos.pos[0] + (p.isDouble ? 1 : 1.5), prevPiecePos.pos[1] - 0.5],
            moveDir: PieceDirections.right,
            rot: p.isDouble ? PieceDirections.down : p.joint.value == p.lowValue ? PieceDirections.right : PieceDirections.left,
            piece: p
          };
        } else {
          throw new Error("unexpected");
        }
      }
    }
    this.positions.push(pp);
    for(let f of usedOffs) {
      this.usedCells[[pp.pos[0] + f[0], pp.pos[1] + f[1]]] = pp;
    }
  }

  canPlacePiece(pos, offs) {
    for(let f of offs) {
      if(this.used[[pos[0] + offs[0], pos[1] + offs[1]]] != null) {
        return false;
      }
    }
    return true;
  }
}