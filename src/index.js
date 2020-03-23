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
  constructor(cardNames) {
    if (!cardNames) {
      cardNames = [];
    }
    this.loadCardPool(cardNames);
  }

  loadCardPool(cardNames) {
    this.cardColumns = [...Array(NUM_COLS)].map(_ => []); // Initialize with NUM_COLS empty arrays
    this.nextId = 0;
    cardNames.forEach(c => this.addCard(c));
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
    drop: (item, monitor) => dropCard(props.boardState, monitor.getClientOffset(), item.card),
    collect: monitor => ({
      mousePos: monitor.getClientOffset(),
    }),
  })

  const cardImages = [];
  const cardColumns = props.boardState.cardColumns;
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

// Helper used by Board
const dropCard = (boardState, clientOffset, card) => {
  const newCol = Math.floor(clientOffset.x / COL_WIDTH);
  const newIndexInCol = Math.floor(clientOffset.y / CARD_STACKING_OFFSET);

  boardState.moveCard(card.id, newCol, newIndexInCol);
}

// Card pool input components
const CARD_POOL_INPUT_ELEMENT_ID='card-pool-input'
function CardPoolInput(props) {
  return (
    <textarea id={props.id} rows="5" cols="33"></textarea>
  );
}

class LoadInputButton extends React.Component {
  load() {
    const rawInput = document.getElementById(CARD_POOL_INPUT_ELEMENT_ID).value;
    const cardNames = rawInput.split("\n").map(line => line.trim());
    this.props.topLevelContainer.setState({boardState: new BoardState(cardNames)});
  }

  render() {
    return (
      <input type="button" onClick={() => this.load()} value="Load cards" />
    );
  }
}

// Top-level container component to put everything together
class TopLevelContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      boardState: new BoardState(INITIAL_CARD_NAMES),
    };
  }

  render() {
    return (
      [
        <Board boardState={this.state.boardState} />,
        <div> <CardPoolInput id={CARD_POOL_INPUT_ELEMENT_ID} /> </div>,
        <LoadInputButton topLevelContainer={this} />,
      ]
    );
  }
}

ReactDOM.render(
  <DndProvider backend={Backend}>
    <TopLevelContainer />
  </DndProvider>,
  document.getElementById('root')
);