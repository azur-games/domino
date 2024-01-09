import EventEmitter from 'eventemitter3';
import * as core from '../src';

const init = function () {
  const table = new core.DominoTableFives({targetScore:100, players: 2});

  table.playCycle();

  const connectors = table.players.map(i => new core.UserConnector(new EventEmitter(), i));
  const userTable = new core.UserTable();
  userTable.connection = connectors[0].connection;

  const leftPieceEls = document.querySelectorAll("#leftPanel .piece");
  const rightPieceEls = document.querySelectorAll("#rightPanel .piece");
  const bottomPieceEls = document.querySelectorAll("#bottomPanel .piece");
  const playedPiecesContainer = document.querySelector("#centerPanel");
  const topPanelEl = document.querySelector("#topPanel");
  const movePanelEl = document.querySelector("#movePanel");

  const leftPhraseEl = document.querySelector("#leftPanel .phrase span");
  const rightPhraseEl = document.querySelector("#rightPanel .phrase span");
  const bottomPhraseEl = document.querySelector("#bottomPanel .phrase span");

  const infoEls = {
    'top': document.querySelector("#leftPanel .info"),
    //'right': document.querySelector("#rightPanel .info"),
    'bottom': document.querySelector("#bottomPanel .info"),
  };

  const updateWorkPiecesView = (/** @type {core.PieceDto[]} */pieces, /** @type {Element[]} */els) => {
    for(let i = 0; i < els.length; i++) {
      const p = pieces[i];
      const el = els[i];
      if(!p) {
        el.classList.add('hidden')
        continue;
      } else {
        el.classList.remove('hidden')
      }
      if(p.open) {
        el.classList.remove('closed')
        el.innerHTML = `<div class='left'>${p.values[0]}</div><div class='right'>${p.values[1]}</div>`;
      } else {
        el.classList.add('closed');
      }
    }
  }

  const updateCenterLabel = () => {
    topPanelEl.innerHTML = "Phase: " + userTable.state.phase 
    + "<br/>\nTurn: " + userTable.state.turn
    + "<br/>\nUser: " + connectors.findIndex(i => i.connection == userTable.connection)
    + "<br/>\nTimeout: " + (userTable.timerEnd ? Math.round((userTable.timerEnd.getTime() - Date.now())/1000) : null);
  }

  const updatePlayedView = (/** @type {core.PieceDto[]} */pieces) => {
    let divs = "";
    const minX = Math.min(0, ...pieces.map(p=>p.pos[0]));
    const maxX = Math.max(0, ...pieces.map(p=>p.pos[0]));
    const minY = Math.min(0, ...pieces.map(p=>p.pos[1]));
    const maxY = Math.max(0, ...pieces.map(p=>p.pos[1]));
    playedPiecesContainer.style["width"] = ((maxX - minX) + 4)*2 + 'vh';
    for(let p of pieces) {
      divs += `
      <div 
        class="piece open ${(p.rot == 'left' || p.rot == 'right') ? 'hor' : 'ver'}" 
        style="position: absolute; left: ${4 + (p.pos[0]-minX)*2}vh; bottom: ${4 + (p.pos[1]-minY)*2}vh"
      >
        <div class='${(p.rot == 'left' || p.rot == 'right') ? 'left' : 'top'}'>${ (p.rot == 'right' ||  p.rot == 'down') ? p.values[0]: p.values[1] } </div>
        <div class='${(p.rot == 'left' || p.rot == 'right') ? 'right' : 'bottom'}'>${ (p.rot == 'right' ||  p.rot == 'down') ? p.values[1]: p.values[0] } </div>
      </div>
      `;
    }
    playedPiecesContainer.innerHTML = divs;
  }

  setInterval(updateCenterLabel, 500);

  userTable.eventUpdated.on(() => {
    console.log(new Date(), "state", userTable.state);

    updateCenterLabel();

    const topPieces = userTable.state.pieces.filter(i => i.place == core.PlaceTypes.WORKSET && i.side == core.PlayerSides.TOP);
    updateWorkPiecesView(topPieces, leftPieceEls);
    const bottomPieces = userTable.state.pieces.filter(i => i.place == core.PlaceTypes.WORKSET && i.side == core.PlayerSides.BOTTOM);
    updateWorkPiecesView(bottomPieces, bottomPieceEls);

    const playedPieces = userTable.state.pieces.filter(i => i.place == core.PlaceTypes.PLAYED);
    updatePlayedView(playedPieces);
    
    // possible moves
    movePanelEl.innerHTML = userTable.state.possibleMoves.map((v,k) => `<button onclick='commitMove(${k})'>${JSON.stringify(v)}</button>`)
      .join('<br/>\n');

    // 
    for(let s of Object.keys(userTable.state.players)) {
      infoEls[s].innerHTML = "<pre>" + JSON.stringify(
        userTable.state.players[s], null, s == core.PlayerSides.BOTTOM ? 0 : 1) + '</pre>';
    }
  });

  userTable.eventPhrase.on((side, msg) => {
    const el = side == 'bottom' ? bottomPhraseEl 
      : side == 'left' ? leftPhraseEl 
      : side == 'right' ? rightPhraseEl
      : null;
    if(!el) return;
    const txt = JSON.stringify(msg);
    el.innerHTML = txt;
    setTimeout(() => {
      if(el.innerHTML == txt) {
        el.innerHTML = "-";
      }
    }, 10000)
  });

  window.switchUser = (idx) => {
    userTable.connection = connectors[idx].connection;
  }

  window.commitMove = (idx) => {
    userTable.move(userTable.state.possibleMoves[idx]);
  }
}


document.addEventListener('DOMContentLoaded', init);