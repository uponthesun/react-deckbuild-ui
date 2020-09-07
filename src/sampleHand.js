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
    this.state = this.getNewHandState();
  }

  getNewHandState() {
    const shuffledDeck = shuffle(this.props.maindeckBoardState.getCards());
    const hand = []

    const numCardsToDraw = Math.min(HAND_SIZE, shuffledDeck.length);
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

  render () {
    const cardImageURLs = this.state.hand.map(card => card.data.imageURL);
    const images = cardImageURLs.map(url => <img src={url} width={IMG_WIDTH} height={IMG_HEIGHT} />);

    return (
      <>
        <button onClick={() => this.drawCard()}>Draw card</button>
        <button onClick={() => this.setState(this.getNewHandState())}>New hand</button>
        <div>
          {images}
        </div>
      </>
    );
  }
}