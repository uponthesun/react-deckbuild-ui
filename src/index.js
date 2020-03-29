import React from 'react';
import ReactDOM from 'react-dom';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd'
import './index.css';
import BoardState from './boardState.js';
import { CardPoolInput, LoadInputButton, ExportButton } from './importExport.js';

const IMG_WIDTH = 146;
const IMG_HEIGHT = 204;
const COL_WIDTH = IMG_WIDTH + 1;
const CARD_STACKING_OFFSET = 25;
const NUM_COLS = 8; // TODO: make this consistent with css width
const INITIAL_CARD_NAMES = ['Battle Hymn', 'Reaper King', 'Death or Glory', 'Mindless Automaton',
                            'Wizard Mentor', 'Crow Storm', "Gaea's Touch"];

// Card react component - displays a single draggable card
function Card(props) {
  const [_, drag] = useDrag({
    item: { type: "Card", card: props.card },
  });

  const imageURL = `https://api.scryfall.com/cards/named?format=image&exact=${encodeURI(props.card.name)}`;

  // Moves the card from the current board to the other board when double-clicked.
  const moveToOtherBoard = (card) => {
    const maindeck = props.topLevelContainer.state.boardState;
    const sideboard = props.topLevelContainer.state.sideboardState;
    const destination = (card.currentBoard === maindeck) ? sideboard : maindeck;
    card.currentBoard.removeCard(card);
    destination.addCard(card);
    // Hacky way to force everything to re-render; TODO: might want to refactor so this isn't needed
    props.topLevelContainer.setState(props.topLevelContainer.state);
  };

  return (
    <img
      ref={drag}
      src={imageURL} width={IMG_WIDTH} height={IMG_HEIGHT}
      onDoubleClick={() => moveToOtherBoard(props.card)}
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

      cardImages.push(<Card
        key={card.id.toString()}
        card={card}
        top={topOffset}
        left={leftOffset}
        zIndex={i}
        topLevelContainer={props.topLevelContainer}
      />);
    }
  }

  const widthPx = COL_WIDTH * props.boardState.numCols;
  return (
    <div ref={drop} className="card-space" style={{position: "relative", width: `${widthPx}px`}}>
      {cardImages}
      <div style={{position: "absolute", bottom: "5px", right: "5px"}}>{props.boardState.numCards()} cards</div>
    </div>
  );
}

// Helper used by Board
const dropCard = (boardState, clientOffset, card) => {
  const newCol = Math.min(Math.floor(clientOffset.x / COL_WIDTH), boardState.numCols - 1);
  const newIndexInCol = Math.floor(clientOffset.y / CARD_STACKING_OFFSET);

  boardState.moveCard(card, newCol, newIndexInCol);
}

// Sort components
function SortByCmcButton (props) {
  return (
    <input type="button"
      onClick={() => props.topLevelContainer.setState({boardState: props.topLevelContainer.state.boardState.sortByCmc()})}
      value="Sort by CMC" />
  );
}

function SortByColorButton (props) {
  return (
    <input type="button"
      onClick={() => props.topLevelContainer.setState({boardState: props.topLevelContainer.state.boardState.sortByColor()})}
      value="Sort by Color" />
  );
}

// Instructions component
function Instructions (props) {
  return (
    <div  style={{float: 'right'}}>
      Large space is the maindeck, smaller space is the sideboard. <br />
      Drag and drop to move cards around. <br />
      Double-click a card to move it from the maindeck to sideboard or vice versa. <br />
      Multiple formats are supported for "Load cards", including MTG Arena. <br />
      Valid example lines: <br />
      Wizard Mentor <br />
      1 Battle Hymn <br />
      5 Forest <br />
      1 Cogwork Assembler (AER) 145
    </div>
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
    const CARD_POOL_INPUT_ELEMENT_ID = 'card-pool-input';
    return (
      <div>
        <Board boardState={this.state.boardState} topLevelContainer={this} />
        <Board boardState={this.state.sideboardState} topLevelContainer={this} />
        <CardPoolInput id={CARD_POOL_INPUT_ELEMENT_ID} />
        <LoadInputButton inputElementId={CARD_POOL_INPUT_ELEMENT_ID} topLevelContainer={this} />
        <SortByCmcButton topLevelContainer={this} />
        <SortByColorButton topLevelContainer={this} />
        <ExportButton boardState={this.state.boardState} sideboardState={this.state.sideboardState} />
        <Instructions />
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