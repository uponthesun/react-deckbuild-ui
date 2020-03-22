import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const cards = [['Battle Hymn', 'Reaper King', 'Death or Glory'],
                ['Mindless Automaton', 'Wizard Mentor']];

class Card extends React.Component {
  render() {
    const imageURL = `https://api.scryfall.com/cards/named?format=image&exact=${encodeURI(this.props.cardName)}`;
    return (
      <img
        src={imageURL} width="146" height="204"
        style={{
          position: "absolute",
          top: `${40 * this.props.stackIndex}px`,
          left: `${147 * this.props.col}px`,
          zIndex: `${this.props.stackIndex}`
        }} />
    );
  }
}

class Space extends React.Component {
  renderCards(cards) {
    const cardImages = [];

    for (var col = 0; col < cards.length; col++) {
      for (var i = 0; i < cards[col].length; i++) {
        cardImages.push(<Card cardName={cards[col][i]} stackIndex={i} col={col} />);
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