(function () {
  "use strict";

  // From Sizzle
  //   https://github.com/jquery/sizzle/blob/master/sizzle.js
  var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
  var match = {
    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    TAG: /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g,
    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/g,
    PSEUDO_CLASS: /[^:]:(?!first-line|first-letter|before|after)((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/g,
    PSEUDO_ELEMENT: /(:first-line|:first-letter|:before|:after)|::((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/g
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
      if (m = chunker.exec(rest)) {
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

      if (m = part.match(match.ID)) a += m.length;
      if (m = part.match(match.ATTR)) b += m.length;
      if (m = part.match(match.CLASS)) b += m.length;
      if (m = part.match(match.TAG)) c += m.length;
      if (m = part.match(match.PSEUDO_CLASS)) b += m.length;
      if (m = part.match(match.PSEUDO_ELEMENT)) c += m.length;
    }

    return [a, b, c];
  }

  // Internal: Determine the primary category and key of a selector.
  //
  // Attempts to mirror WebKit's RuleSet::addRule rule set mappings.
  // https://github.com/WebKit/webkit/blob/master/Source/WebCore/css/StyleResolver.cpp
  //
  // parts - Parsed selector Array.
  //
  // Returns a pair with first 'id', 'class', 'tag', or 'universal'.
  // Then a String key value
  function detectCategoryAndKey(parts) {
    var m, last = parts[parts.length - 1];
    if (!last) {
      return ['universal', '*'];
    } else if (m = last.match(match.ID)) {
      return ['id', m[0].slice(1)];
    } else if (m = last.match(match.CLASS)) {
      return ['class', m[0].slice(1)];
    } else if (m = last.match(match.TAG)) {
      return ['tag', m[0]];
    } else {
      return ['universal', '*'];
    }
  }

  // Internal: Analyze and score the selector efficiency.
  //
  // 1 being the most efficient and 10 being the least.
  //
  // parts - Parsed selector Array.
  //
  // Returns an Object with a score, Number 1 through 10 and
  // an Array of reason strings.
  function analyze(parts) {
    var last = parts[parts.length - 1];
    var score = 1;
    var messages = [];

    if (!last) {
    }

    // ID category
    else if (last.match(match.ID)) {
      // Check for redundant class name
      if (last.match(match.CLASS)) {
        messages.push("ID is overly qualified by a class name");
        score++;
      }

      // Check for redundant tag name
      if (last.match(match.TAG)) {
        messages.push("ID is overly qualified by a tag name");
        score++;
      }

      // Check for redundant descendant selectors
      if (parts.length > 1) {
        if (parts[parts.length - 2] === '>') {
          messages.push("ID is overly qualified by a child selector");
          score++;
        } else {
          messages.push("ID is overly qualified by a descendant selector");
          score++;
        }
      }
    }

    // Class category
    else if (last.match(match.CLASS)) {
      score += 1;

      if (parts.length > 1) {
        if (parts[parts.length - 2] === '>') {
          messages.push("Uses a child selector with a rightmost class selector");
          score += 2;
        } else {
          messages.push("Uses a descendant selector with a rightmost class selector");
          score += 4;
        }
      }
    }

    // Tag category
    else if (last.match(match.TAG)) {
      score += 2;

      if (parts.length > 1) {
        if (parts[parts.length - 2] === '>') {
          messages.push("Uses a child selector with a rightmost tag selector");
          score += 4;
        } else {
          messages.push("Uses a descendant selector with a rightmost tag selector");
          score += 5;
        }
      }
    }

    // Universal category
    else {
      score += 3;

      if (parts.length > 1) {
        if (parts[parts.length - 2] === '>') {
          messages.push("Uses a child selector with a rightmost universal selector");
          score += 5;
        } else {
          messages.push("Uses a descendant selector with a rightmost universal selector");
          score += 6;
        }
      }
    }

    if (score < 1 || score > 10) {
      throw "score out of range";
    }

    return {score: score, messages: messages};
  }

  // Public: Explains a CSS selector.
  //
  // selector - CSS selector String.
  //
  // Returns an Object.
  function cssExplainSelector(selector) {
    var parts       = parse(selector);
    var specificity = computeSpecificity(parts);
    var category    = detectCategoryAndKey(parts);
    var analysis    = analyze(parts);

    return {
      selector: selector,
      parts: parts,
      category: category[0],
      key: category[1],
      specificity: specificity,
      score: analysis.score,
      messages: analysis.messages
    };
  }

  // Public: Explains a CSS selector.
  //
  // obj      - CSS selector String.
  // multiple - Boolean to return multiple rules results.
  //
  // Returns an Object.
  function cssExplain(obj, multiple) {
    if (multiple === false) {
      return cssExplain(obj, true)[0];
    }

    if (obj !== null && typeof obj == 'object') {
      if ('length' in obj) {
        var i, results = [];
        for (i = 0; i < obj.length; i++) {
          results = results.concat(cssExplain(obj[i], true));
        }
        return results;
      } else if ('cssRules' in obj) {
        return cssExplain(obj.cssRules, multiple);
      } else if ('selectorText' in obj) {
        return cssExplain(obj.selectorText, multiple);
      }
    }

    if (typeof obj === 'string') {
      if (obj.match(/,/)) {
        return cssExplain(obj.split(/\s*,\s*/), multiple || false);
      } else {
        return cssExplainSelector(obj);
      }
    }

    return multiple ? [] : null;
  }

  if (typeof exports !== 'undefined') {
    exports.cssExplain = cssExplain;
  } else {
    window.cssExplain = cssExplain;
  }
})();
