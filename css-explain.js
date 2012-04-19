(function() {
  "use strict";

  // From Sizzle
  //   https://github.com/jquery/sizzle/blob/master/sizzle.js
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
  var match = {
    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    TAG: /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/g,
    PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/g
  };

  // Internal: Parse CSS selector into parts.
  //
  // Adopted from Sizzle.
  //
  // selector - CSS selector String.
  //
  // Returns an Array of Strings.
  function parse(selector) {
    var m, rest = selector, parts = [];

    do {
      chunker.exec("");
      m = chunker.exec(rest);
      if (m) {
        rest = m[3];
        parts.push(m[1]);
        if (m[2]) {
          break;
        }
      }
    } while (m);

    return parts;
  }

  // Internal: Compute the specificity of a selector.
  //
  // parts - Parsed selector Array.
  //
  // Returns an 3 tuple Array of Numbers.
  function computeSpecificity(parts) {
    var a = 0, b = 0, c = 0;

    var part, m, i, len;
    for (i = 0, len = parts.length; i < len; i++) {
      part = parts[i];

      m = part.match(match.ID);
      if (m) a += m.length;

      m = part.match(match.ATTR);
      if (m) b += m.length;

      m = part.match(match.CLASS);
      if (m) b += m.length;

      m = part.match(match.TAG);
      if (m) c += m.length;

      m = part.match(match.PSEUDO);
      if (m) c += m.length;
    }

    return [a, b, c];
  }

  // Internal: Determine the primary category of a selector.
  //
  // parts - Parsed selector Array.
  //
  // Returns 'id', 'class', 'tag', or 'universal'.
  function detectCategory(parts) {
    var last = parts[parts.length-1];
    if (last.match(match.ID)) {
      return 'id';
    } else if (last.match(match.CLASS)) {
      return 'class';
    } else if (last.match(match.TAG)) {
      return 'tag';
    } else {
      return 'universal';
    }
  }

  // Internal: Score the selector efficiency.
  //
  // 1 being the most efficient and 10 being the least.
  //
  // parts - Parsed selector Array.
  //
  // Returns a Number 1 through 10.
  function computeScore(parts) {
    var last = parts[parts.length-1];

    // Descendant selectors
    if (parts.length > 1) {
      // Child selectors
      if (parts[parts.length-2] === '>') {
        if (last.match(match.ID)) {
          return 3;
        } else if (last.match(match.CLASS)) {
          return 5;
        } else if (last.match(match.TAG)) {
          return 7;
        } else {
          return 9;
        }

      // Descendant selectors
      } else {
        if (last.match(match.ID)) {
          return 4;
        } else if (last.match(match.CLASS)) {
          return 6;
        } else if (last.match(match.TAG)) {
          return 8;
        } else {
          return 10;
        }
      }

    // Simple selectors
    } else {
      if (last.match(match.ID)) {
        // Over qualified ID
        if (last.match(match.CLASS) || last.match(match.TAG)) {
          return 3;

        // Basic ID
        } else {
          return 1;
        }

      // Simple tag
      } else if (last.match(match.TAG)) {
        return 3;

      // Simple class
      } else if (last.match(match.CLASS)) {
        return 2;

      } else {
        return 1;
      }
    }
  }

  // Public: Explains a CSS selector.
  //
  // selector - CSS selector String.
  //
  // Returns an Object.
  function cssExplain(selector) {
    var parts       = parse(selector);
    var specificity = computeSpecificity(parts);
    var category    = detectCategory(parts);
    var score       = computeScore(parts);

    return {
      parts: parts,
      category: category,
      specificity: specificity,
      score: score
    };
  }

  if (typeof exports !== 'undefined') {
    exports.cssExplain = cssExplain;
  } else {
    window.cssExplain = cssExplain;
  }
})();
