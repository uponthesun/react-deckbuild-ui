// This file contains components and logic related to importing and exporting from text formats.

import React from 'react';
import BoardState from './boardState.js';

// Card pool input components
const CardPoolInput = function (props) {
  return (
    <textarea id={props.id} rows="5" cols="33"></textarea>
  );
}

const isNumber = (text) => {
  return !Number.isNaN(Number(text));
}

class LoadInputButton extends React.Component {
  inputToCardNames(rawInput) {
    const lines = rawInput.split("\n").filter(l => l.trim().length > 0);
    const [maindeckCardNames, sideboardCardNames] = [[], []];
    var currentSection = maindeckCardNames;

    for (var line of lines) {
      if (line.includes('Sideboard')) {
        currentSection = sideboardCardNames;
        continue;
      }

      // MTG Arena text format has the set name in () after the card name. Remove that portion if present.
      line = line.split('(')[0].trim();

      var quantity = 1;
      // If the line starts with a number, consume that part of the string and store in quantity
      if (isNumber(line[0])) {
        const i = line.indexOf(" ");
        quantity = Number(line.substring(0, i));
        line = line.substring(i).trim();
      }

      // The remaining portion of the string should be just the card name; add it n times
      for (var n = 0; n < quantity; n++) {
        currentSection.push(line);
      }
    }

    return [maindeckCardNames, sideboardCardNames];
  }

  load() {
    const rawInput = document.getElementById(this.props.inputElementId).value;
    const [maindeckCardNames, sideboardCardNames] = this.inputToCardNames(rawInput);

    const numCols = this.props.topLevelContainer.state.boardState.numCols;
    const cardLoader = this.props.topLevelContainer.state.cardLoader;
    this.props.topLevelContainer.setState({
      boardState: new BoardState(cardLoader, maindeckCardNames, numCols),
      sideboardState: new BoardState(cardLoader, sideboardCardNames, 1)
    });
  }

  render() {
    return (
      <input type="button" onClick={() => this.load()} value="Load cards" />
    );
  }
}

// Export button components
const toCockatriceFormat = (maindeck, sideboard) => {
  return maindeck.map(c => c.name).join("\n") +
    "\n\n// Sideboard\n" +
    sideboard.map(c => c.name).join("\n");
}

const writeToClipboardAndAlert = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert(`Copied to clipboard:\n\n${text}`),
      () => alert(`Failed to copy to clipboard`));
}

const ExportButton = function (props) {
  return (
    <input type="button"
      onClick={() => {
        const output = toCockatriceFormat(props.boardState.cardColumns.flat(), props.sideboardState.cardColumns.flat());
        writeToClipboardAndAlert(output);
      }}
      value="Export to Cockatrice" />
  );
}

export {
  CardPoolInput,
  LoadInputButton,
  ExportButton,
};