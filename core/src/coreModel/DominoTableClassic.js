import { DominoTable } from "./DominoTable";
import * as Types from '../types';
import { DELAY_DISTRIBUTE, DELAY_SCORE } from "./delays";
import lodash from 'lodash';

export class DominoTableClassic extends DominoTable{
  mode = "classic";

  get playMoveAvailable() { // block
    return (this.players.find(p => p.workSet.movablePieces.length > 0) != null || this.unusedSet.pieces.length > 0) && this.players.find(p => p.workSet.pieces.length == 0) == null;
  }

  async playMove() { // block
    if(this.turn.workSet.movablePieces) {      
      await this.makePlayerMove();
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
      winner.winScore = this.players.filter(p=>p!=winner).map(p=>p.piecesSumValue).reduce((a,b)=>a+b,0);
    }    
    this.syncState(DELAY_SCORE);
    await this.waitSync();
    if(winner != null) {
      winner.score += winner.winScore;
      winner.winScore = 0;
    }
  }
}