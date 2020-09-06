// This file contains logic for loading card data from Scryfall
export default class CardLoader {
  constructor() {
    this.nextId = 0;
  }

  async getCardData(cardName, set = '') {
    const newCard = {
      name: cardName,
      id: this.nextId,
    };
    this.nextId++;   
    await this.getCardDataAsync(cardName, set).then(data => newCard.data = data);
    return newCard;
  }

  async getCardDataAsync(cardName, set = '') {
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
      
      return {
        color_pile,
        colors,
        cmc: cardJson['cmc'],
        imageURL: cardJson['image_uris']['normal']
      }
    } catch (e) {
      console.error(`Error parsing card data: ${e}. Card JSON: ${JSON.stringify(cardJson)}`);
      throw e;
    }
  }
}