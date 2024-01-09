import { DominoTable } from "./DominoTable";
import * as Types from '../types';
import { Piece } from "./Piece";
import lodash from "lodash";
import { DELAY_DISTRIBUTE } from "./delays";

export class DominoTableFives extends DominoTable{
  mode = "fives";

  async startRound() {
    this.pivot = null;
    await super.startRound();
  }

  get playMoveAvailable() { 
    return (this.players.find(p => p.workSet.movablePieces.length > 0) != null || this.unusedSet.pieces.length > 0) 
      && this.players.find(p => p.workSet.pieces.length == 0) == null;
  }

  async playFirstMove(){
    await super.playFirstMove();
    await this.handlePivot();
    await this.handleFives();
  }

  async playMove() { // block
    if(this.turn.workSet.movablePieces.length  > 0) {      
      await this.makePlayerMove();
      await this.handlePivot();
      await this.handleFives();
      this.turn = this.turn.next; 
    } else if (this.unusedSet.pieces.length > 0) {
      this.turn.workSet.add(this.unusedSet.pieces[0]);
      this.syncState(DELAY_DISTRIBUTE);
      await this.waitSync();
    } else {
      this.eventPhrase.emit(this.turn, {msg:Types.MsgTypeDict.PASS});
      this.turn = this.turn.next; 
      this.syncState(0);
    }
  }

  async handlePivot() {
    if(this.pivot != null) return;
    let lastPiece = this.playedSet.pieces.reverse()[0];
    if(lastPiece.isDouble) {
      this.pivot = lastPiece;
      this.joints.push(
        {piece:lastPiece,value:lastPiece.lowValue,additional:true},
        {piece:lastPiece,value:lastPiece.lowValue,additional:true},
      );
    }
  }

  async handleFives(){
    var s = this.joints.filter(j => j.additional == false)
      .map(j => (j.piece.isDouble && this.joints.filter(j2 => !j2.additional && j2.piece == j.piece).length == 1) ? (j.value*2) : j.value)
      .reduce((a,b)=>a+b, 0);
    if(s%5 == 0) {
      this.turn.moveScore += s;
    }
  }

  async scoring() {
    this.phase = Types.Phases.SCORING;
    let winner = this.players.find(p=>p.workSet.pieces.length == 0);
    if(winner == null) {
      const minScore = Math.min(...this.players.map(p => p.piecesSumValue));
      const minScorePlayers = this.players.filter(p=>p.piecesSumValue == minScore);
      if(minScorePlayers.length == 1) {
        winner = minScorePlayers[0];
      }
    }
    if(winner != null) {
      var s = this.players.filter(p=>p!=winner).map(p=>p.piecesSumValue).reduce((a,b)=>a+b,0);
      winner.winScore = Math.ceil(s/5)*5;
    }    
    this.syncState(3000);
    await this.waitSync();
    for(let p of this.players) {
      p.score += p.winScore + p.moveScore;
      p.winScore = 0;
      p.moveScore = 0;
    }
  }
}