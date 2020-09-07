import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Backend from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd'
import './index.css';
import BoardState from './boardState.js';
import { CardPoolInput, LoadInputButton, ExportButton } from './importExport.js';
import { LandAdder } from './landAdder.js';
import CardLoader from './cardLoader.js';
import SampleHandModalButton from './sampleHand.js';

const IMG_WIDTH = 146;
const IMG_HEIGHT = 204;
const COL_WIDTH = IMG_WIDTH + 1;
const CARD_STACKING_OFFSET = 25;
const NUM_COLS = 8; // TODO: make this consistent with css width
const INITIAL_CARD_NAMES = ['Battle Hymn', 'Reaper King', 'Death or Glory', 'Mindless Automaton',
                            'Wizard Mentor', 'Crow Storm', "Gaea's Touch"];
const INITIAL_CARD_ENTRIES = INITIAL_CARD_NAMES.map(name => ({name, quantity: 1, set: ''}));

// Card react component - displays a single draggable card. If you hover over the normal card image, 
// also displays a larger version next to it.
function Card(props) {
  const [{ isDragging }, drag] = useDrag({
    item: { type: "Card", card: props.card },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  const imageURL = props.card.data ? props.card.data.imageURL : ''

  const [hoverVisible, setHoverVisible] = useState(false);
  const hoverVisibility = (hoverVisible && !isDragging) ? 'visible' : 'hidden';

  return (
    [
      // The normal version of the card.
      <img
        ref={drag}
        src={imageURL} width={IMG_WIDTH} height={IMG_HEIGHT}
        onDoubleClick={() => props.moveCardToOtherBoard(props.card)}
        // We use onMouseMove here instead of onMouseOver because apparently onMouseOver will fire after
        // you drag and drop the top card of a stack, leading to weird behavior.
        onMouseMove={(e) => !hoverVisible && setHoverVisible(true)}
        onMouseLeave={() => setHoverVisible(false)}
        style={{
          position: "absolute",
          top: `${props.top}px`,
          left: `${props.left}px`,
          zIndex: `${props.zIndex}`,
        }} />,
      // The larger "preview" image - only visible when hovering over the normal version of the card.
      <img
        src={imageURL} width={IMG_WIDTH * 2} height={IMG_HEIGHT * 2}
        style={{
          visibility: hoverVisibility,
          position: "absolute",
          top: `${props.top}px`,
          left: `${props.left + IMG_WIDTH}px`,
          zIndex: 999
        }}
      />,
    ]
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
        moveCardToOtherBoard={props.moveCardToOtherBoard}
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

    const cardLoader = new CardLoader();
    this.state = {
      cardLoader: cardLoader,
      boardState: new BoardState(cardLoader, INITIAL_CARD_ENTRIES, NUM_COLS, this),
      sideboardState: new BoardState(cardLoader, [], 1, this),
    };
  }
  
  moveCardToOtherBoard(card, board, otherBoard) {
    board.removeCard(card);
    otherBoard.addCard(card);
    // Hacky way to force everything to re-render; TODO: make board states immutable and directly set the state with new versions
    this.setState({});
  }

  async addLand(landName, count) {
    const currentBoard = this.state.boardState;
    const cardLoader = this.state.cardLoader;
    for (var _ of Array(count)) {
      const card = await cardLoader.getCardData(landName)
      currentBoard.addCard(card)
    }

    this.setState({});
  }

  render() {
    const CARD_POOL_INPUT_ELEMENT_ID = 'card-pool-input';
    const moveCardToSideboard = (card) => {
      this.moveCardToOtherBoard(card, this.state.boardState, this.state.sideboardState);
    }
    const moveCardToMainboard = (card) => {
      this.moveCardToOtherBoard(card, this.state.sideboardState, this.state.boardState);
    }

    return (
      <div>
        <Board boardState={this.state.boardState} moveCardToOtherBoard={moveCardToSideboard} />
        <Board boardState={this.state.sideboardState} moveCardToOtherBoard={moveCardToMainboard} />
        <CardPoolInput id={CARD_POOL_INPUT_ELEMENT_ID} />
        <LoadInputButton inputElementId={CARD_POOL_INPUT_ELEMENT_ID} topLevelContainer={this} />
        <SortByCmcButton topLevelContainer={this} />
        <SortByColorButton topLevelContainer={this} />
        <ExportButton boardState={this.state.boardState} sideboardState={this.state.sideboardState} />
        <SampleHandModalButton maindeckBoardState={this.state.boardState} />
        <LandAdder addLand={(land, count) => this.addLand(land, count)}/>
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