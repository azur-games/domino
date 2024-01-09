import { Piece } from "../coreModel/Piece";
import { Player } from "../coreModel/Player";
import { PlayerWorkSet } from "../coreModel/PlayerWorkSet";
import { Phases, PlayerSides } from "../types";

export class UserConnector {

  /** @readonly */
  connection
  
  /** @readonly */
  player

  beforeSend = null;
  beforeMove = null;

  constructor(
    /** @type {import("eventemitter3").EventEmitter} */ connection, 
    /** @readonly @type {Player} */ player) {
    this.connection = connection;
    this.player = player
    this.table.eventUpdated.on(() => this.sendState());
    this.table.eventPhrase.on((p,m) => this.sendPhrase(p,m));
    this.connection.on("sync", () => this.sendState());
    this.connection.on("move", m => this.makeMove(m));
  }

  get table() {
    return this.player.table;
  }

  sendPhrase(p, msg) {
    if(this.beforeSend) {
      this.beforeSend("phrase", this.playerToSide(p), msg);
    }
    this.connection.emit("phrase", this.playerToSide(p), msg);
  }

  sendState(){
    /** @type {import("./UserTable").TableDto} */
    const dto = {
      pieces: this.table.pieces.slice(0).sort((a,b)=>a.shuffleOrder-b.shuffleOrder).map(c => this.toPieceDto(c)),
      phase: this.table.phase,
      turn: this.playerToSide(this.table.turn),
      possibleMoves: this.table.canMove(this.player) ? this.table.possibleMoves : [],
      targetScore: this.table.targetScore,
      syncDelayMillis: this.table.syncTimeMillis - Date.now(),
      timerEndDelayMillis: this.table.playerTimer.endDelay,
      timerDurationMillis: this.table.playerTimer.duration,
      players: Object.assign({}, ... this.table.players.map(p=>({[this.playerToSide(p)]: this.getPlayerInfo(p)}))),

    };
    if(this.beforeSend) {
      this.beforeSend("state", dto);
    }
    this.connection.emit("state", dto);
  }

  getPlayerInfo(/** @type {Player} */ p) {
    /** @type {import("../types").PlayerInfo} */
    return {
      id: p.data.id,
      name: p.data.name,
      icon: p.data.icon,

      side: this.playerToSide(p),

      moveScore: p.moveScore,
      winScore: p.winScore,
      score: p.score,
    }
  }

  /**
   * 
   * @param {Piece} c 
   * @returns {import("./UserTable").PieceDto}
   */
  toPieceDto(c) {
    const visible = c.place == this.table.playedSet || c.place == this.player.workSet;
    const cp = c.place.player ? c.place.player : 
      (c.place == this.table.playedSet && c.prevPlace instanceof PlayerWorkSet) ? c.prevPlace.player : 
      null;
    const side = this.playerToSide(cp);
    const order = visible ? c.order : c.shuffleOrder;
    const l = this.table.layout.positions.find(lp => lp.piece == c);
    return {
      values: (visible || c.shown) ? c.values : null,
      shown: c.shown,
      open: visible,
      place: c.place.name,
      side: side,
      order: order,
      joint: c.joint == null ? null : {
        piece: c.joint.piece.values,
        additional: c.joint.additional,
        value: c.joint.value
      },
      pos: l == null ? null : l.pos,
      rot: l == null ? null : l.rot
    }
  }

  playerToSide(player) {   
    if(this.player == player) return PlayerSides.BOTTOM;
    if(this.table.players.length == 2) {
      return PlayerSides.TOP;
    }
    if(this.player.next == player) return PlayerSides.LEFT;
    if(this.table.players.length == 3) {
      return PlayerSides.RIGHT;
    }
    if(this.player.next.next == player) return PlayerSides.TOP;
    if(this.player.next.next.next == player) return PlayerSides.RIGHT;
    return null;
  }

  makeMove(move){
    if(this.beforeMove) {
      this.beforeMove(move)
    }
    this.player.move(move);
  }
}