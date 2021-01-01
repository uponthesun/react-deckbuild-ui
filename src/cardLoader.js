// This file contains logic for loading card data from Scryfall
export default class CardLoader {
  constructor() {
    this.nextId = 0;
    this.cardDataCache = {};
  }

  async getCardData(cardName, set = '') {
    const newCard = {
      name: cardName,
      id: this.nextId,
    };
    this.nextId++;   

    if (!this.cardDataCache[cardName]) {
      this.cardDataCache[cardName] = {};
    }

    if (!this.cardDataCache[cardName][set]) {
      this.cardDataCache[cardName][set] = await this.getScryfallCardData(cardName, set);
    }

    newCard.data = this.cardDataCache[cardName][set];
    return newCard;
  }

  async getScryfallCardData(cardName, set = '') {
    const url = `https://api.scryfall.com/cards/named?exact=${encodeURI(cardName)}&set=${set}`;
    const response = await fetch(url);
    var cardJson = await response.json();

    try {
      // If double-faced card, some of the fields we need will be on the faces instead.
      // Add all the fields from the front face to the top-level object.
      if ('card_faces' in cardJson) {
        Object.assign(cardJson, cardJson['card_faces'][0]);
      }

      var colors = cardJson['colors'].join('');
      var color_pile = colors;
      if (color_pile.length > 1) {
        color_pile = 'M' // multicolor
      } else if (color_pile.length === 0) {
        colors = color_pile = 'C' // colorless
      }

      if (cardJson['type_line'].includes('Land')) {
        color_pile = 'L';
      }
      
      const types = cardJson['type_line'].split('—')[0].trim();

      return {
        color_pile,
        colors,
        cmc: cardJson['cmc'],
        imageURL: cardJson['image_uris']['normal'],
        types
      }
    } catch (e) {
      console.error(`Error parsing card data: ${e}. Card JSON: ${JSON.stringify(cardJson)}`);
      return {
        color_pile : 'C',
        colors: 'C',
        cmc: 0,
        imageURL: `https://api.scryfall.com/cards/named?format=image&exact=${cardName}`,
        types: new Set()
      }
    }
  }
}