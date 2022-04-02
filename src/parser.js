import {tokenType} from './tokenizer.js'
const util = require('util')

export default class Parser {
  constructor() {
  }

  parseProgram(tokens) {
    var selectors = []
    var cur = 0;
    while (cur < tokens.length) {
      let [newCur, selector] = this.parseSelector2(tokens, cur);
      selectors.push(selector);
      cur = newCur;
    }
    //console.debug('program selectors', selectors)
    return {type: 'merge', params: selectors};
  }
  
  parseSelector2(tokens, cur) {
    var selector = null;
    while (cur < tokens.length && tokens[cur].type != tokenType.COMMA) {
      var token = tokens[cur];
      if (this.isAtomicSelectorToken(token)) {
        var [cur, obj] = this.parseToken(tokens, cur);
        if (!selector) {
          var node = {type: "group", params: [obj]}
          selector = node;
        } else if (selector.params.length < 2) {
          selector.params.push(obj);
          selector = {type: "group", params: [selector]}
        } else {
          selector = {type: "group", params: [selector, obj]}
        }
      } else {
        if (token.type == tokenType.WHITESPACE) {
          if (this.isWhitespaceCombinator(tokens, cur)) {
            selector = {type: "descendant", params: [selector]}
          }
        } else if (token.type == tokenType.LARGER_THAN) {
            selector = {type: "child", params: [selector]}
        } else if (token.type == tokenType.PLUS) {
            selector = {type: "nextSibling", params: [selector]}
        } else if (token.type == tokenType.WAVY_LINE) {
            selector = {type: "subsequentSibling", params: [selector]}
        }
        ++cur;
      }
    }

    if (cur < tokens.length) {
      ++cur;
    }

    //console.debug(util.inspect(selector, {showHidden: false, depth: null, colors: true}))
    return [cur, selector]
  }

  parseID(tokens, cur) {
    var value = tokens[cur].value.split("#")[1];
    return [cur + 1, {type: 'id', value: value, token: tokens[cur]}] 
  }

  parseClass(tokens, cur) {
    var value = tokens[cur].value.split(".")[1];
    return [cur + 1, {type: 'class', value: value, token: tokens[cur]}] 
  }

  parseWhitespace(tokens, cur, last) {
    var left = cur;
    var right = cur;
    while (left >= 0 && tokens[left].type == tokenType.WHITESPACE) {
      --left;
    }
    while (right < tokens.length && tokens[right].type == tokenType.WHITESPACE) {
      ++right;
    }

    if (left >= 0 && right < tokens.length && this.isAtomicSelectorToken(tokens[left]) && this.isAtomicSelectorToken(tokens[right])) {
      let [newRight, rightToken]= this.parseToken(tokens, right, last);
      return [newRight, {type: 'descendant', value: [last, rightToken], token: tokens[cur]}];
    }
    return [right, null] 
  }

  parseLargerThan(tokens, cur, last) {
    cur = cur + 1;
    while (cur < tokens.length && tokens[cur].type == tokenType.WHITESPACE) {
      ++cur;
    }

    if (cur >= tokens.length || !this.isAtomicSelectorToken(tokens[cur])) {
      throw `Invalid parameter: >`;
    }

    let [newCur, obj] = this.parseToken(tokens, cur, last);
    return [newCur, {type: 'child', value: [last, obj]}]
  }

  parseWavyLine(tokens, cur, last) {
    //console.log(tokens[cur])
    cur = cur + 1;
    while (cur < tokens.length && tokens[cur].type == tokenType.WHITESPACE) {
      ++cur;
    }

    if (cur >= tokens.length || !this.isAtomicSelectorToken(tokens[cur])) {
      throw "Invalid parameter ~";
    }

    //console.log(tokens[cur])

    var [cur, obj] = this.parseToken(tokens, cur, last);
    return [cur, {type: 'subsequentSibling', value: [last, obj]}]
  }

  parsePlus(tokens, cur, last) {
    cur = cur + 1;
    while (cur < tokens.length && tokens[cur].type == tokenType.WHITESPACE) {
      ++cur;
    }

    if (cur >= tokens.length || !this.isAtomicSelectorToken(tokens[cur])) {
      throw "Invalid parameter +";
    }

    let [newCur, obj] = this.parseToken(tokens, cur, last);
    return [newCur, {type: 'nextSibling', value: [last, obj]}]
  }

  parseToken(tokens, cur, last) {
    var token = tokens[cur];
    //console.debug(cur, token, token.type)
    if (token.type == tokenType.GLOBAL) {
      return [cur + 1, {type: 'global', value: '*', token: token}] 
    } else if (token.type == tokenType.IDENTIFIER) {
      return [cur + 1, {type: 'identifier', value: token.value, token: token}] 
    } else if (token.type == tokenType.ID) {
      return this.parseID(tokens, cur)
    } else if (token.type == tokenType.CLASS) {
      return this.parseClass(tokens, cur)
    } else if (token.type == tokenType.WHITESPACE) {
      return this.parseWhitespace(tokens, cur, last);
    } else if (token.type == tokenType.PLUS) {
      return this.parsePlus(tokens, cur, last);
    } else if (token.type == tokenType.WAVY_LINE) {
      return this.parseWavyLine(tokens, cur, last);
    } else if (token.type == tokenType.LARGER_THAN) {
      return this.parseLargerThan(tokens, cur, last);
    } else {
      throw "Unrecognized token"
    }
  } 

  isAtomicSelectorToken(token) {
    return (token.type == tokenType.GLOBAL 
      || token.type == tokenType.IDENTIFIER
      || token.type == tokenType.ID
      || token.type == tokenType.CLASS
      );
  }
  
  isGroupType(obj) {
    return obj.type == 'group'
      || obj.type == 'descendant'
      || obj.type == 'child'
      || obj.type == 'subsequentSibling'
      || obj.type == 'nextSibling';
  }

  isWhitespaceCombinator(tokens, cur) {
    var left = cur;
    var right = cur;
    while (left >= 0 && tokens[left].type == tokenType.WHITESPACE) {
      --left;
    }
    while (right < tokens.length && tokens[right].type == tokenType.WHITESPACE) {
      ++right;
    }

    return (left >= 0 
      && right < tokens.length 
      && this.isAtomicSelectorToken(tokens[left]) 
      && this.isAtomicSelectorToken(tokens[right]));
  }
}

