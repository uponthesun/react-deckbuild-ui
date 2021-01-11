// This file contains a component for adding basic lands to the deck.

import React from 'react';

function LandAdder(props) {
  const selectorId = props.id + '-selector';
  const inputCountId = props.id + '-input-count';

  return (
    <div>
      <select id={selectorId}>
        <option value='Snow-Covered Plains'>Snow-Covered Plains</option>
        <option value='Snow-Covered Island'>Snow-Covered Island</option>
        <option value='Snow-Covered Swamp'>Snow-Covered Swamp</option>
        <option value='Snow-Covered Mountain'>Snow-Covered Mountain</option>
        <option value='Snow-Covered Forest'>Snow-Covered Forest</option>
      </select>
      <input type='number'
        min='0'
        max='20'
        placeholder='1'
        id={inputCountId}
      />
      <input type='button'
        onClick={() => {
          const land = document.getElementById(selectorId).value;
          const count = parseInt(document.getElementById(inputCountId).value) || 1;
          props.addLand(land, count, 'ICE')
        }}
        value='Add Basic Lands'
      />
    </div>
  );
}

export {
  LandAdder,
};