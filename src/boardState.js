// Manages state of a "board". Purely a logical representation, doesn't know about React components.
export default class BoardState {
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
    cardNames.forEach(c => this.createAndAddCard(c));
  }

  // Creates a new card object, including initializing it with Scryfall data and a unique ID,
  // and adds it to this board.
  async createAndAddCard(cardName) {
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

  // Adds the given card object to this board. Does not create a new card object.
  // Can optionally specify where the new card should be inserted (defaults to bottom of first column).
  addCard(card, newCol = 0, newIndexInCol = undefined) {
    if (!newIndexInCol || newIndexInCol > this.cardColumns[newCol].length) {
      newIndexInCol = this.cardColumns[newCol].length;
    }

    this.cardColumns[newCol].splice(newIndexInCol, 0, card);
    card.currentBoard = this;
  }

  // Removes the given card from this board and returns it.
  removeCard(card) {
    // TODO: could consider storing mapping of id to position to avoid for loop lookup
    for (var col = 0; col < this.cardColumns.length; col++) {
      const cardCol = this.cardColumns[col];
      for (var i = 0; i < cardCol.length; i++) {
        if (cardCol[i].id === card.id) {
          cardCol.splice(i, 1);
          return card;
        }
      }
    }

    throw "Tried to remove card, but it wasn't in this board: " + JSON.stringify(card);
  }

  // Moves a card into the specified position in this board. If it was in a different board previously,
  // first removes it from that board.
  async moveCard(card, newCol, newIndexInCol) {
    card.currentBoard.removeCard(card);
    this.addCard(card, newCol, newIndexInCol);
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
