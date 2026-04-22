// @ts-check
const parse5 = require('parse5');

/**
 * @typedef {parse5.DefaultTreeAdapterTypes.Document} Document
 * @typedef {Document['childNodes'][number] | Document} Node
 * @typedef {parse5.Token.Attribute} Attr
 */

/**
 * @param {Node} node
 * @param {((node: Node) => boolean)[]} satisfiers
 * @returns {Node[]}
 */
function walk(node, satisfiers) {
  if (satisfiers.every(s => s(node))) {
    if ('childNodes' in node) {
      return [node, ...node.childNodes.map(child => walk(child, satisfiers)).flat()];
    } else {
      return [node];
    }
  } else {
    if ('childNodes' in node) {
      return node.childNodes.map(child => walk(child, satisfiers)).flat();
    }
  }
  return [];
}

/**
 * @param {Node} node
 * @param {((attr: Attr) => boolean)[]} satisfiers
 */
function hasAttr(node, satisfiers) {
  if ('attrs' in node) {
    for (const attr of node.attrs) {
      if (satisfiers.every(s => s(attr))) {
        return true;
      }
    }
  }
  return false;
}

class Block {
  document;

  /**
   * @param {string|Node} contentOrDocument
   */
  constructor(contentOrDocument) {
    if (typeof contentOrDocument === 'string') {
      this.document = parse5.parse(contentOrDocument);
    } else {
      this.document = contentOrDocument;
    }
  }

  /**
   * @param {string} selector
   * @returns {Block | null}
   */
  querySelector(selector) {
    const alternatives = selector.split(',').map(s => s.trim());
    for (const alternative of alternatives) {
      const pieces = alternative.replace(/[ \t\n]+/g, ' ').split(' ').map(function (s) {
        const trimmed = s.trim();
        if (trimmed) {
          const [tag, id, className] = (trimmed.match(/^([a-zA-Z][a-zA-Z0-9]*)?(\#[a-zA-Z][a-zA-Z0-9\-_]*)?(\.[a-zA-Z][a-zA-Z0-9\-_\.]*)?$/) || []).slice(1);
          if (tag || id || className) {
            return {
              tag,
              id: id?.slice(1),
              className
            };
          }
        }
      }).filter(o=>!!o);
      /** @type {Node[]} */
      let partialMatches = [];
      const firstPiece = pieces.shift();
      if (firstPiece) {
        let piecePartials = walk(this.document, [(node) => {
          if (!firstPiece.tag) return true;
          if (firstPiece.tag && 'tagName' in node && node.tagName === firstPiece.tag) {
            return true;
          }
          return false;
        }]);
        if (firstPiece.id) {
          piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'id' && attr.value === firstPiece.id]));
        }
        if (firstPiece.className) {
          const classNames = firstPiece.className.split('.').map(s => s.trim()).filter(s => !!s);
          piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'class' && classNames.every(name=>attr.value.includes(name))]));
        }
        partialMatches = piecePartials;
      }
      while (pieces.length > 0) {
        const piece = pieces.shift();
        if (piece) {
          let piecePartials = partialMatches.map(node => walk(node, [(node) => {
            if (!piece.tag) return true;
            if (piece.tag && 'tagName' in node && node.tagName === piece.tag) {
              return true;
            }
            return false;
          }])).flat().filter(m=>!!m);
          if (piece.id) {
            piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'id' && attr.value === piece.id]));
          }
          if (piece.className) {
            const classNames = piece.className.split('.').map(s => s.trim()).filter(s => !!s);
            piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'class' && classNames.every(name=>attr.value.includes(name))]));
          }
          partialMatches = piecePartials;
        }
      }
      if (partialMatches.length > 0) {
        return new Block(partialMatches[0]);
      }
    }
    return null;
  }

  /**
   * @param {string} selector
   * @returns {Block[]}
   */
  querySelectorAll(selector) {
    /** @type {Block[]} */
    const output = [];
    const alternatives = selector.split(',').map(s => s.trim());
    for (const alternative of alternatives) {
      const pieces = alternative.replace(/[ \t\n]+/g, ' ').split(' ').map(function (s) {
        const trimmed = s.trim();
        if (trimmed) {
          const [tag, id, className] = (trimmed.match(/^([a-zA-Z][a-zA-Z0-9]*)?(\#[a-zA-Z][a-zA-Z0-9\-_]*)?(\.[a-zA-Z][a-zA-Z0-9\-_\.]*)?$/) || []).slice(1);
          if (tag || id || className) {
            return {
              tag,
              id: id?.slice(1),
              className
            };
          }
        }
      }).filter(o=>!!o);
      /** @type {Node[]} */
      let partialMatches = [];
      const firstPiece = pieces.shift();
      if (firstPiece) {
        let piecePartials = walk(this.document, [(node) => {
          if (!firstPiece.tag) return true;
          if (firstPiece.tag && 'tagName' in node && node.tagName === firstPiece.tag) {
            return true;
          }
          return false;
        }]);
        if (firstPiece.id) {
          piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'id' && attr.value === firstPiece.id]));
        }
        if (firstPiece.className) {
          const classNames = firstPiece.className.split('.').map(s => s.trim()).filter(s => !!s);
          piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'class' && classNames.every(name=>attr.value.includes(name))]));
        }
        partialMatches = piecePartials;
      }
      while (pieces.length > 0) {
        const piece = pieces.shift();
        if (piece) {
          let piecePartials = partialMatches.map(node => walk(node, [(node) => {
            if (!piece.tag) return true;
            if (piece.tag && 'tagName' in node && node.tagName === piece.tag) {
              return true;
            }
            return false;
          }])).flat().filter(m=>!!m);
          if (piece.id) {
            piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'id' && attr.value === piece.id]));
          }
          if (piece.className) {
            const classNames = piece.className.split('.').map(s => s.trim()).filter(s => !!s);
            piecePartials = piecePartials.filter(node => hasAttr(node, [(attr) => attr.name === 'class' && classNames.every(name=>attr.value.includes(name))]));
          }
          partialMatches = piecePartials;
        }
      }
      output.push(...partialMatches.map(node => new Block(node)));
    }
    return output;
  }

  serialize() {
    return parse5.serialize(/** @type {any} */(this.document));
  }
}

module.exports = Block;