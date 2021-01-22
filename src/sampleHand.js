import React from 'react';
import Modal from 'react-modal';


export default class SampleHandModalButton extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      showModal: false
    };

    this.handleOpenModal = () => {this.setState({showModal: true})};
    this.handleCloseModal = () => {this.setState({showModal: false})};
  }

  render () {
    return (
      <>
        <button onClick={this.handleOpenModal}>Sample Hand</button>
        <Modal
           isOpen={this.state.showModal}
           onRequestClose={this.handleCloseModal}
           contentLabel="Sample Hand"
           style={{
             overlay: {zIndex: 1000}
           }}
        >
        <SampleHandModalContent maindeckBoardState={this.props.maindeckBoardState} />
        <p>(ESC or click outside to close)</p>
        </Modal>
      </>
    );
  }
}

const HAND_SIZE = 7;

/**
 * Copied from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const IMG_WIDTH = 146;
const IMG_HEIGHT = 204;

class SampleHandModalContent extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      ...this.getNewHandState(),
      lockedCard: ""
    };
  }

  getNewHandState() {
    const shuffledDeck = shuffle(this.props.maindeckBoardState.getCards());
    const hand = []

    if (this.state && !!this.state.lockedCard) {
      // If a card is selected to be locked into your opening hand,
      // find it and add it to the hand first.
      const i = shuffledDeck.findIndex(card => card.name == this.state.lockedCard);
      hand.push(shuffledDeck[i]);
      shuffledDeck.splice(i, 1);
    }

    const numCardsToDraw = Math.min(HAND_SIZE - hand.length, shuffledDeck.length);
    for (var _ of Array(numCardsToDraw)) {
      hand.push(shuffledDeck.pop());
    }

    return {shuffledDeck, hand}
  }

  drawCard() {
    if (this.state.shuffledDeck.length > 0) {
      this.state.hand.push(this.state.shuffledDeck.pop());
      this.setState({});
    }
  }

  handleChange(e) {
    this.setState({lockedCard: e.target.value});
  }

  render () {
    const cardImageURLs = this.state.hand.map(card => card.data.imageURL);
    const images = cardImageURLs.map(url => <img src={url} width={IMG_WIDTH} height={IMG_HEIGHT} />);
    const dedupedCardNames = Array.from(new Set(this.props.maindeckBoardState.getCards().map(card => card.name))).sort();
    const options = dedupedCardNames.map(name => <option value={name}>{name}</option>);

    return (
      <>
        <button onClick={() => this.drawCard()}>Draw card</button>
        <button onClick={() => this.setState(this.getNewHandState())}>New hand</button>
        <select id="reserved-card-select" onChange={(e) => this.handleChange(e)} tabindex="-1">
          <option value="">-- Lock a card into opening hand --</option>
          {options}
        </select>
        <div>
          {images}
        </div>
      </>
    );
  }
}