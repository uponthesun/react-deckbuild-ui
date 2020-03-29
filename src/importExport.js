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
  load() {
    const rawInput = document.getElementById(this.props.inputElementId).value;
    // For now, just trim off quantities if present. TODO: actually use the quantities
    const cardNames = rawInput.split("\n").map((line) => {
      line = isNumber(line[0]) ? line.substring(line.indexOf(" ")) : line;
      return line.trim();
    }).filter(line => line.trim().length > 0);

    const numCols = this.props.topLevelContainer.state.boardState.numCols;
    this.props.topLevelContainer.setState({
      boardState: new BoardState(cardNames, numCols),
      sideboardState: new BoardState([], 1)
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