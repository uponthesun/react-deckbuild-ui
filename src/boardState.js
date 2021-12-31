// Manages state of a "board". Purely a logical representation, doesn't know about React components.
export default class BoardState {
  // cardEntries - Array of objects with keys: {name, quantity, set}
  constructor(cardLoader, cardEntries, numCols, parentComponent = null) {
    this.cardLoader = cardLoader;
    this.numCols = numCols;
    this.loadCardPool(cardEntries, parentComponent);
  }

  async loadCardPool(cardEntries, parentComponent) {
    this.cardColumns = [...Array(this.numCols)].map(_ => []); // Initialize with numCols empty arrays
    for (var entry of cardEntries) {
      // TODO: A major refactor is needed to simplify state management. Not sure how best to it,
      // but one option could be to merge this class with the Board react component. Until then,
      // we need this manual refresh.
      this.createAndAddCards(entry).then(value => {
        if (parentComponent) {
          parentComponent.setState({});
        }
      })
    }
  }

  // Creates a new card object, including initializing it with Scryfall data and a unique ID,
  // and adds it to this board.
  async createAndAddCards(cardEntry) {
    var result;
    for (var n = 0; n < cardEntry.quantity; n++) {
      const newCard = await this.cardLoader.getCardData(cardEntry.name, cardEntry.set);
      newCard.currentBoard = this;
      this.cardColumns[0].push(newCard);
      result = newCard;
    }
    return result;
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

  numCards() {
    return this.cardColumns.flat().length;
  }

  getCards() {
    return this.cardColumns.flat();
  }

  sortByCmc() {
    const newCardColumns = [...Array(this.numCols)].map(_ => []);

    for (var card of this.cardColumns.flat()) {
      var col = card.data.cmc;
      if (card.data.mana_cost.includes('{X}')) {
        // Assume each X must be at least 1
        const numXes = (card.data.mana_cost.split('{X}').length - 1)
        col += numXes;
      }
      if (col === 0 && card.data.color_pile !== 'L') {
        // nonland 0-drops should be in 1-drop column
        col = 1;
      }
      col = Math.min(col, 7); // everything CMC 7 and up goes in one pile

      newCardColumns[col].push(card);
    }
    for (var column of newCardColumns) {
      column.sort((c1, c2) => c1.name.localeCompare(c2.name))
    }

    this.cardColumns = newCardColumns;
    return this;
  }

  sortByColor() {
    const newCardColumns = [...Array(this.numCols)].map(_ => []);

    const colorColumns = ['L', 'W', 'U', 'B', 'R', 'G', 'C', 'M'];

    const monocolorCards = this.cardColumns.flat().filter(c => c.data.color_pile !== 'M');
    const multicolorCards = this.cardColumns.flat().filter(c => c.data.color_pile === 'M');
    multicolorCards.sort((c1, c2) => c1.data.colors.localeCompare(c2.data.colors));

    for (var card of [...monocolorCards, ...multicolorCards]) {
      const col = colorColumns.indexOf(card.data.color_pile);
      newCardColumns[col].push(card);
    }
    for (var column of newCardColumns) {
      column.sort((c1, c2) => c1.name.localeCompare(c2.name))
    }

    this.cardColumns = newCardColumns;
    return this;
  }

  asText(includeSet) {
    const cardToText = (c) => {
      var line = c.name;
      if (includeSet && c.set) {
        line += ` (${c.set})`
      }
      return line;
    };

    const counts = {};
    for (var card of this.cardColumns.flat()) {
      const cardAsText = cardToText(card);
      if (!counts.hasOwnProperty(cardAsText)) {
        counts[cardAsText] = 0;
      }
      counts[cardAsText]++;
    }

    return Object.entries(counts).map(entry => `${entry[1]} ${entry[0]}`).join("\n");
  }
}

