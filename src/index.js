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
const SPACE_COLUMNS = [...Array(NUM_COLS)].map(_ => []);
const INITIAL_CARD_NAMES = [['Battle Hymn', 'Reaper King', 'Death or Glory'],
                            ['Mindless Automaton', 'Wizard Mentor']];
var nextId = 0;
for (var i = 0; i < INITIAL_CARD_NAMES.length; i++) {
  for (var name of INITIAL_CARD_NAMES[i]) {
    SPACE_COLUMNS[i].push({name: name, cardId: nextId});
    nextId++;
  }
}
console.log(JSON.stringify(SPACE_COLUMNS));

function Card(props) {
  const [_, drag] = useDrag({
    item: { type: "Card", name: props.name, cardId: props.cardId },
  });

  const imageURL = `https://api.scryfall.com/cards/named?format=image&exact=${encodeURI(props.name)}`;
  return (
    <img
      ref={drag}
      src={imageURL} width={IMG_WIDTH} height={IMG_HEIGHT}
      style={{
        position: "absolute",
        top: `${CARD_STACKING_OFFSET * props.stackIndex}px`,
        left: `${COL_WIDTH * props.col}px`,
        zIndex: `${props.stackIndex}`
      }} />
  );
}

function dropCard(clientOffset, card) {
  for (var col = 0; col < SPACE_COLUMNS.length; col++) {
    for (var i = 0; i < SPACE_COLUMNS[col].length; i++) {
      if (SPACE_COLUMNS[col][i].cardId === card.cardId) {
        SPACE_COLUMNS[col].splice(i, 1);
      }
    }
  }

  const newCol = Math.floor(clientOffset.x / COL_WIDTH);
  const newStackIndex = Math.min(Math.floor(clientOffset.y / CARD_STACKING_OFFSET), SPACE_COLUMNS[newCol].length);

  SPACE_COLUMNS[newCol].splice(newStackIndex, 0, {name: card.name, cardId: card.cardId});
  console.log(JSON.stringify(SPACE_COLUMNS));
}

function Space(props) {
  const [{ mousePos }, drop] = useDrop({
    accept: "Card",
    drop: (item, monitor) => dropCard(monitor.getClientOffset(), item),
    collect: monitor => ({
      mousePos: monitor.getClientOffset(),
    }),
  })

  const cardImages = [];

  for (var col = 0; col < SPACE_COLUMNS.length; col++) {
    for (var i = 0; i < SPACE_COLUMNS[col].length; i++) {
      const cardObj = SPACE_COLUMNS[col][i]
      cardImages.push(<Card name={cardObj.name} cardId={cardObj.cardId} key={cardObj.cardId.toString()} col={col} stackIndex={i} />);
    }
  }

  return (
    <div ref={drop} className="card-space">
      {cardImages}
    </div>
  );
}

ReactDOM.render(
  <DndProvider backend={Backend}> <Space /> </DndProvider>,
  document.getElementById('root')
);