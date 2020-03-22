import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const cards = [['Battle Hymn', 'Reaper King', 'Death or Glory'],
                ['Mindless Automaton', 'Wizard Mentor']];

class Space extends React.Component {
  renderCards(cards) {
    const cardImages = [];

    for (var col = 0; col < cards.length; col++) {
      for (var i = 0; i < cards[col].length; i++) {
        const card = cards[col][i];
        const imageURL = `https://api.scryfall.com/cards/named?format=image&exact=${encodeURI(card)}`;
        const image = <img
                        src={imageURL} width="146" height="204"
                        style={{
                          position: "absolute",
                          top: `${40 * i}px`,
                          left: `${147 * col}px`,
                          zIndex: `${i}`
                        }} />
        cardImages.push(image);
      }
    }

    return cardImages;
  }

  render() {
    return (
      <div class="card-space">
        {this.renderCards(cards)}
      </div>
    );
  }
}

ReactDOM.render(<Space />, document.getElementById('root'));