// This file contains components and logic related to importing and exporting from text formats.

import React from 'react';
import BoardState from './boardState.js';

// Card pool input components
const CardPoolInput = function (props) {
  return (
    <textarea id={props.id} rows="5" cols="33">{props.initialText}</textarea>
  );
}

const isNumber = (text) => {
  return !Number.isNaN(Number(text));
}

const parseCardPoolText = (cardPoolText) => {
  const lines = cardPoolText.split("\n").filter(l => l.trim().length > 0);
  const sections = [[], []]; // two sections - maindeck and sideboard
  var currentSection = sections[0];

  for (var line of lines) {
    if (line.includes('Sideboard')) {
      currentSection = sections[1];
      continue;
    }

    currentSection.push(parseLine(line));
  }

  return sections;
}

const parseLine = (line) => {
  var [part1, part2] = line.split('(');

  var quantity, name;
  // If the line starts with a number, consume that part of the string and store in quantity
  if (isNumber(part1[0])) {
    const i = part1.indexOf(' ');
    var quantityPart = part1.substring(0, i)
    if (quantityPart.endsWith('x')) {
      quantityPart = quantityPart.slice(0, -1); // trim off "x" in the case of "1x <cardname>"
    }
    quantity = Number(quantityPart);
    name = part1.substring(i).trim();
  } else {
    quantity = 1;
    name = part1.trim();
  }

  var set = ''
  if (part2) {
    set = part2.split(')')[0].trim();
  }

  return {name, quantity, set};
}

class LoadInputButton extends React.Component {
  load() {
    const rawInput = document.getElementById(this.props.inputElementId).value;
    const [maindeckCardEntries, sideboardCardEntries] = parseCardPoolText(rawInput);

    const numCols = this.props.topLevelContainer.state.boardState.numCols;
    const cardLoader = this.props.topLevelContainer.state.cardLoader;
    this.props.topLevelContainer.setState({
      boardState: new BoardState(cardLoader, maindeckCardEntries, numCols, this.props.topLevelContainer),
      sideboardState: new BoardState(cardLoader, sideboardCardEntries, 1, this.props.topLevelContainer)
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

// Copy link button components

const encodeCards = (maindeck, sideboard) => {
  const cardToLine = (c) => {
    var line = c.name;
    if (c.set) {
      line += `(${c.set})`
    }
    return line;
  };

  const cardPoolText = maindeck.map(card => cardToLine(card)).join("\n") +
    "\n\n// Sideboard\n" +
    sideboard.map(card => cardToLine(card)).join("\n");
  return window.btoa(cardPoolText);
}

const SaveLinkButton = function (props) {
  return (
    <input type="button"
      onClick={() => {
        const encoded = encodeCards(props.boardState.cardColumns.flat(), props.sideboardState.cardColumns.flat());
        window.history.replaceState({}, '', `?cards=${encoded}`);
        writeToClipboardAndAlert(window.location.href);
      }}
      value="Copy Link" />
  );
}

export {
  CardPoolInput,
  LoadInputButton,
  ExportButton,
  SaveLinkButton,
  parseCardPoolText,
};