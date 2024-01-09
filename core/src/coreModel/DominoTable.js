import events from 'eventemitter3';
import lodash from 'lodash';
import * as Types from '../types';
import { Card, Piece } from './Piece';
import { Place } from './Place';
import { UnusedSet } from './UnusedSet';
import { Player } from './Player';
import { PlayerTimer } from './PlayerTimer';
import { TypedEvent0, TypedEvent1, TypedEvent2 } from '../utils/emmiterUtils';
import { PlayerWorkSet } from './PlayerWorkSet';
import { PlayedPlace } from './PlayedPlace';
import { DELAY_ASSEMBLE, DELAY_DISTRIBUTE, DELAY_MOVE, DELAY_MOVE_ANIMATION, DELAY_SHOW } from './delays';
import { PiecesLayout } from './PiecesLayout';

/** @typedef {{piece:Piece, additional: boolean, value: Types.PieceValue}} Joint  */

export class DominoTable extends events.EventEmitter  {
  /** @readonly */
  eventUpdated = new TypedEvent0(this, "updated");
  /** @readonly */
  eventFinished = new TypedEvent0(this, "finished");
  /** @readonly @type {TypedEvent2<Player, Types.MessageDto>} */
  eventPhrase = new TypedEvent2(this, "phrase");

  /** @type {Piece[]} @readonly */
  pieces;
  /** @type {UnusedSet} @readonly */
  unusedSet;
  /** @type {Place} @readonly */
  playedSet;
  /** @type {Player[]} @readonly */
  players;
  /** @type {PlayerTimer} @readonly  */
  playerTimer;  
  /** @type {integer} @readonly */
  targetScore;
  /** @type {Joint[]} */
  joints;

  /** @type {integer} */
  syncTimeMillis;
  /** @type {Player} */
  turn;
  /** @type {Types.Phase} */
  phase;

  /** @type {function(Player, Types.Move)} @private */
  moveCallback;

  /** @type {Types.Move[]} */
  possibleMoves;

  /** @type {Piece} */
  pivot;
  
  /** @type {PiecesLayout} */
  layout;

  constructor({targetScore=10, /** @type {(2|3|4)} */players=2}) {
    super();
    this.unusedSet = new UnusedSet(this);
    this.playedSet = new PlayedPlace(this);
    this.pieces = Types.PieceValues.flatMap(mn => Types.PieceValues.filter(mx => mx >= mn).map(mx => new Piece([mn, mx], this.unusedSet, 0)));
    this.unusedSet.shuffle();
    this.players = Array.from(Array(players)).map(i=>new Player(this));
    for(let i = 0; i < this.players.length; i++) {
      this.players[i].data.id = -i;
      this.players[i].data.name = "Player#" + i;
    }
    this.playerTimer = new PlayerTimer();
    this.targetScore = targetScore;
    this.syncTimeMillis = 0;
    this.possibleMoves = [];
    this.joints = [];
    this.layout = new PiecesLayout(this);
    this.playedSet
  }

  playCycle = async() => {
    while(this.players.find(p => p.score >= this.targetScore) == null) {
      await this.startRound();
      await this.playing(); 
      await this.scoring();
    }
    this.phase = Types.Phases.END;
    this.syncState(0);
    this.eventFinished.emit()
  }

  async startRound() {
    this.turn = null;
    this.phase = null;
    this.joints = [];
    this.layout.reset();

    await this.assemblePieces();
    await this.distributePieces();
  }

  async assemblePieces() {
    for(let c of this.pieces) {
      c.shown = false;
      c.joint = null;
      this.unusedSet.add(c);
    }
    this.unusedSet.shuffle();
    this.syncState(DELAY_ASSEMBLE);
    await this.waitSync();
  }

  async distributePieces() {
    this.phase = Types.Phases.DISTRIBUTION;
    for(let i = 0; i < 7; i++) {
      for(let p of this.players) {
        p.workSet.add(this.unusedSet.pieces[0]);
      }
    }
    this.syncState(DELAY_DISTRIBUTE);
    await this.waitSync();    
  }

  async playing() {
    this.phase = Types.Phases.PLAYING;
    await this.setFirstTurn();
    await this.playFirstMove();
    this.turn = this.turn.next;
    while(this.playMoveAvailable) {
      await this.playMove();
    }
  }

  async setFirstTurn() {
    let piecePairs = this.players.flatMap(p => p.workSet.pieces.map(i => ({p:p,i:i})))
    const doubles = piecePairs.filter(i => i.i.highValue == i.i.lowValue);
    let highestPiece;
    if(doubles.length > 0) {
      highestPiece = doubles.sort((a, b)=> -(a.i.highValue-b.i.highValue))[0];      
    } else {
      highestPiece = piecePairs.sort((a, b) => - (a.i.superiority-b.i.superiority))[0];
    }
    this.turn = highestPiece.p;
    highestPiece.i.shown = true;
    this.syncState(DELAY_SHOW);
    this.eventPhrase.emit(highestPiece.p, {msg: Types.MsgTypeDict.SHOW_HIGHEST, piece: highestPiece.i.values, duration: DELAY_SHOW});
    await this.waitSync();        
  }

  async playFirstMove(){
    const m = await this.fetchMove(this.turn.workSet.pieces.map(i => ({action:"move", piece: i.values, joint: null})));
    const p = this.pieces.find(i => lodash.isEqual(i.values, m.piece));
    this.playedSet.add(p);
    this.layout.add(p);
    this.joints.push(
      {piece:p, additional: false, value: p.lowValue},
      {piece:p, additional: false, value: p.highValue},
    );
    this.syncState(DELAY_MOVE_ANIMATION);
    await this.waitSync();
  }

  get playMoveAvailable() { // block
    throw new Error("not implemented");
  }

  async playMove() { // block
    throw new Error("not implemented");
  }

  async scoring() {
    throw new Error("not implemented");
  }

  async makePlayerMove() {
    const m = await this.fetchMove(this.turn.workSet.movablePieces.flatMap(
      i => i.suitableTableJoints.map(
        j => ({action:"move", piece: i.values, joint:{piece:j.piece.values, value: j.value, additional: j.additional}})
      )
    ));
    const p = this.pieces.find(i => lodash.isEqual(i.values, m.piece));
    p.joint = p.suitableTableJoints.find(j => lodash.isEqual(m.joint.piece, j.piece.values) 
      && m.joint.additional == j.additional && m.joint.value == j.value);
    this.joints[this.joints.indexOf(p.joint)] = {piece: p, value: p.freeValue, additional: false};
    this.playedSet.add(p);
    this.layout.add(p);
    this.syncState(DELAY_MOVE_ANIMATION);
    await this.waitSync();
  }
 
  /**
   * @param {Player} player 
   * @param {Types.Move} move 
   */
  move(player, move){
    if(this.moveCallback == null) return;  
    this.moveCallback(player, move);
    this.moveCallback = null;
  }

  /**
   * @param {Player} player
   */
  canMove(player) {
    return this.turn == player && this.phase == Types.Phases.PLAYING;
  }

  /**
   * 
   * @param {Types.Move[]} possibleMoves 
   * @returns {Promise<Types.Move>}
   */
  async fetchMove(possibleMoves = []) {
    this.possibleMoves = possibleMoves;
    this.playerTimer.eventComplete.once(this.automove, this);
    this.playerTimer.schedule(DELAY_MOVE);
    this.syncState(0);

    /** @type {{player:Player, move: Types.Move}}  */
    let res = null;
    while(res == null || res.player != this.turn || this.possibleMoves.find(i => lodash.isEqual(i, res.move)) == null) {
      res = await new Promise(r => this.moveCallback = (p, m) => r({player:p, move:m}));      
    }

    this.possibleMoves = [];
    this.playerTimer.cancel();
    this.playerTimer.eventComplete.off(this.automove, this);
    this.syncState(0);
    return res.move;
  }

  automove(){
    this.move(this.turn, this.possibleMoves[Math.floor(Math.random()*this.possibleMoves.length)]);
  }

  /** @param {integer} syncMillis */
  syncState(syncMillis = 0) {
    this.syncTimeMillis = Math.max(Date.now() + syncMillis, this.syncTimeMillis);
    this.eventUpdated.emit();
  }

  async waitSync(maxWait = null) {
    let w = (maxWait != null) ? Math.min(maxWait, this.syncTimeMillis - Date.now()): this.syncTimeMillis - Date.now();
    if(w > 0 && !this.finished && !this._noWait) {
      await new Promise(r => setTimeout(r, w));
    }
  }

  /**
   * @param {Player | null} p
   * @returns {Player} Player
   */
  nextPlayer(p) {
    return this.players[(this.players.indexOf(p) + 1) % this.players.length];
  } 
}