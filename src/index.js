import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd'

const IMG_WIDTH = 146;
const IMG_HEIGHT = 204;
const COL_WIDTH = IMG_WIDTH + 1;
const CARD_STACKING_OFFSET = 40;
const NUM_COLS = 8;
const INITIAL_CARD_NAMES = ['Battle Hymn', 'Reaper King', 'Death or Glory', 'Mindless Automaton', 'Wizard Mentor'];

class BoardState {
  constructor(initialCards) {
    this.cardColumns = [...Array(NUM_COLS)].map(_ => []); // Initialize with NUM_COLS empty arrays
    this.nextId = 0;

    if (initialCards) {
      initialCards.forEach(c => this.addCard(c));
    }
  }

  addCard(cardName) {
    this.cardColumns[0].push({name: cardName, id: this.nextId});
    this.nextId++; // TODO: Do we need to worry about concurrency? I don't think so but not positive
  }

  moveCard(id, newCol, newIndexInCol) {
    // remove card from current position
    // TODO: could consider storing mapping of id to position to avoid for loop lookup
    var cardToMove;
    for (var col = 0; col < this.cardColumns.length; col++) {
      const cardCol = this.cardColumns[col];
      for (var i = 0; i < cardCol.length; i++) {
        if (cardCol[i].id === id) {
          cardToMove = cardCol[i];
          cardCol.splice(i, 1);
        }
      }
    }

    // add card to new position
    newIndexInCol = Math.min(newIndexInCol, this.cardColumns[newCol].length);
    this.cardColumns[newCol].splice(newIndexInCol, 0, cardToMove);
  }
}

// Figure out how to maintain this state inside Board component cleanly?
//DND hooks force Board to be a function component
const BOARD_STATE = new BoardState(INITIAL_CARD_NAMES);

// Card react component - displays a single draggable card
function Card(props) {
  const [_, drag] = useDrag({
    item: { type: "Card", card: props.card },
  });

  const imageURL = `https://api.scryfall.com/cards/named?format=image&exact=${encodeURI(props.card.name)}`;
  return (
    <img
      ref={drag}
      src={imageURL} width={IMG_WIDTH} height={IMG_HEIGHT}
      style={{
        position: "absolute",
        top: `${props.top}px`,
        left: `${props.left}px`,
        zIndex: `${props.zIndex}`,
      }} />
  );
}

// Board react component - the space that all the cards are in
function Board(props) {
  const [{ mousePos }, drop] = useDrop({
    accept: "Card",
    drop: (item, monitor) => dropCard(monitor.getClientOffset(), item.card),
    collect: monitor => ({
      mousePos: monitor.getClientOffset(),
    }),
  })

  const cardImages = [];
  const cardColumns = BOARD_STATE.cardColumns;
  for (var col = 0; col < cardColumns.length; col++) {
    for (var i = 0; i < cardColumns[col].length; i++) {
      const card = cardColumns[col][i]
      const topOffset = CARD_STACKING_OFFSET * i;
      const leftOffset = COL_WIDTH * col;

      cardImages.push(<Card key={card.id.toString()} card={card} top={topOffset} left={leftOffset} zIndex={i} />);
    }
  }

  return (
    <div ref={drop} className="card-space">
      {cardImages}
    </div>
  );
}

function dropCard(clientOffset, card) {
  const newCol = Math.floor(clientOffset.x / COL_WIDTH);
  const newIndexInCol = Math.floor(clientOffset.y / CARD_STACKING_OFFSET);

  BOARD_STATE.moveCard(card.id, newCol, newIndexInCol);
}

ReactDOM.render(
  <DndProvider backend={Backend}> <Board /> </DndProvider>,
  document.getElementById('root')
);