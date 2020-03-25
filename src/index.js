import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd'

const IMG_WIDTH = 146;
const IMG_HEIGHT = 204;
const COL_WIDTH = IMG_WIDTH + 1;
const CARD_STACKING_OFFSET = 25;
const NUM_COLS = 8; // TODO: make this consistent with css width
const INITIAL_CARD_NAMES = ['Battle Hymn', 'Reaper King', 'Death or Glory', 'Mindless Automaton',
                            'Wizard Mentor', 'Crow Storm', "Gaea's Touch"];

const getCardData = async (cardName) => {
  const url = `https://api.scryfall.com/cards/named?exact=${encodeURI(cardName)}`;
  const response = await fetch(url);
  const cardJson = await response.json();

  var color_pile = cardJson['color_identity'].join('');
  if (color_pile.length > 1) {
    color_pile = 'M' // multicolor
  } else if (color_pile.length === 0) {
    color_pile = 'C' // colorless
  }

  return {
    color_pile,
    cmc: cardJson['cmc'],
  }
}

class BoardState {
  constructor(cardNames, numCols) {
    if (!cardNames) {
      cardNames = [];
    }
    this.numCols = numCols;
    this.loadCardPool(cardNames);
  }

  async loadCardPool(cardNames) {
    this.cardColumns = [...Array(this.numCols)].map(_ => []); // Initialize with numCols empty arrays
    this.nextId = 0;
    cardNames.forEach(c => this.addCard(c));
  }

  async addCard(cardName) {
    const newCard = {
      name: cardName,
      id: this.nextId,
      currentBoard: this,
    };
    this.cardColumns[0].push(newCard);
    this.nextId++; // TODO: Do we need to worry about concurrency? I don't think so but not positive

    getCardData(cardName).then(data => newCard.data = data);
    return newCard;
  }

  async moveCard(card, newCol, newIndexInCol) {
    // remove card from current position
    // TODO: could consider storing mapping of id to position to avoid for loop lookup
    //var cardToMove;
    const removeFrom = card.currentBoard;
    for (var col = 0; col < removeFrom.cardColumns.length; col++) {
      const cardCol = removeFrom.cardColumns[col];
      for (var i = 0; i < cardCol.length; i++) {
        if (cardCol[i].id === card.id) {
          //cardToMove = cardCol[i];
          cardCol.splice(i, 1);
        }
      }
    }

    // add card to new position 
    newIndexInCol = Math.min(newIndexInCol, this.cardColumns[newCol].length);
    this.cardColumns[newCol].splice(newIndexInCol, 0, card);
    card.currentBoard = this;
  }

  sortByCmc() {
    const newCardColumns = [...Array(this.numCols)].map(_ => []);

    for (var card of this.cardColumns.flat()) {
      const col = Math.min(card.data.cmc, 7); // everything CMC 7 and up goes in one pile
      newCardColumns[col].push(card);
    }

    this.cardColumns = newCardColumns;
    return this;
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

  const widthPx = COL_WIDTH * props.boardState.numCols;
  return (
    <div ref={drop} className="card-space" style={{position: "relative", width: `${widthPx}px`}}>
      {cardImages}
    </div>
  );
}

// Helper used by Board
const dropCard = (boardState, clientOffset, card) => {
  const newCol = Math.min(Math.floor(clientOffset.x / COL_WIDTH), boardState.numCols - 1);
  const newIndexInCol = Math.floor(clientOffset.y / CARD_STACKING_OFFSET);

  boardState.moveCard(card, newCol, newIndexInCol);
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
    this.props.topLevelContainer.setState({boardState: new BoardState(cardNames, NUM_COLS)});
  }

  render() {
    return (
      <input type="button" onClick={() => this.load()} value="Load cards" />
    );
  }
}

// Sort components
function SortByCmcButton (props) {
  return (
    <input type="button"
      onClick={() => props.topLevelContainer.setState({boardState: props.boardState.sortByCmc()})}
      value="Sort by CMC" />
  );
}

// Top-level container component to put everything together
class TopLevelContainer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      boardState: new BoardState(INITIAL_CARD_NAMES, NUM_COLS),
      sideboardState: new BoardState([], 1),
    };
  }

  render() {
    return (
      <div>
        <Board boardState={this.state.boardState} />
        <Board boardState={this.state.sideboardState} />
        <CardPoolInput id={CARD_POOL_INPUT_ELEMENT_ID} />
        <LoadInputButton topLevelContainer={this} />
        <SortByCmcButton topLevelContainer={this} boardState={this.state.boardState} />
      </div>
    );
  }
}

ReactDOM.render(
  <DndProvider backend={Backend}>
    <TopLevelContainer />
  </DndProvider>,
  document.getElementById('root')
);