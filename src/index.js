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

const cards = [['Battle Hymn', 'Reaper King', 'Death or Glory'],
                ['Mindless Automaton', 'Wizard Mentor']];

function Card(props) {
  const [collectedProps, drag] = useDrag({
    item: { type: "Card" },
  });

  const imageURL = `https://api.scryfall.com/cards/named?format=image&exact=${encodeURI(props.cardName)}`;
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

function Space(props) {
  const [{ mousePos }, drop] = useDrop({
    accept: "Card",
    drop: (item, monitor) => alert(JSON.stringify(monitor.getClientOffset())),
    collect: monitor => ({
      mousePos: monitor.getClientOffset(),
    }),
  })

  const cardImages = [];

  for (var col = 0; col < cards.length; col++) {
    for (var i = 0; i < cards[col].length; i++) {
      cardImages.push(<Card cardName={cards[col][i]} stackIndex={i} col={col} />);
    }
  }

  return (
    <div ref={drop} class="card-space">
      {cardImages}
    </div>
  );
}

ReactDOM.render(
  <DndProvider backend={Backend}> <Space /> </DndProvider>,
  document.getElementById('root')
);