
// Whitespace
const WHITESPACE_LITERAL = `(?:[ \\t]|(?:\\r\\n|(?!\\r\\n)[\\n\\f\\r]))`
const HEX_DIGIT_LITERAL = `[A-Fa-f0-9]`
const WHITESPACE = new RegExp(WHITESPACE_LITERAL)
// CSS escapes
const CSS_ESCAPES_LITERAL = `(?:\\\\(?:${HEX_DIGIT_LITERAL}{1,6}${WHITESPACE_LITERAL}?|[^\\r\\n\\f]|$))`
// const CSS_ESCAPES = /(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$))/
const IDENTIFIER_LITERAL = `(?:(?:-?(?:[^\\x00-\\x2f\\x30-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|${CSS_ESCAPES_LITERAL})+|--)(?:[^\\x00-\\x2c\\x2e\\x2f\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|${CSS_ESCAPES_LITERAL})*)`
const IDENTIFIER = new RegExp(IDENTIFIER_LITERAL);
// const IDENTIFIER = /(?:(?:-?(?:[^\x00-\x2f\x30-\x40\x5B-\x5E\x60\x7B-\x9f]|(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$)))+|--)(?:[^\x00-\x2c\x2e\x2f\x3A-\x40\x5B-\x5E\x60\x7B-\x9f]|(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$)))*)/
// const IDENTIFIER = `(?:(?:-?(?:[^\\x00-\\x2f\\x30-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|(?:\\\\(?:[A-Fa-f0-9]{1,6}(?:[ \\t]|(?:\\r\\n|(?!\\r\\n)[\\n\\f\\r]))?|[^\\r\n\\f]|$)))+|--)(?:[^\\x00-\\x2c\\x2e\\x2f\\x3A-\\x40\\x5B-\\x5E\\x60\\x7B-\\x9f]|(?:\\\\(?:[A-Fa-f0-9]{1,6}(?:[ \\t]|(?:\\r\\n|(?!\\r\\n)[\\n\\f\\r]))?|[^\\r\\n\\f]|$)))*)`
const ID_SELECTOR = new RegExp("#" + IDENTIFIER_LITERAL)
const CLASS_SELECTOR = new RegExp("\\." + IDENTIFIER_LITERAL)

const tokenType = {
  GLOBAL: "*",
  ID : "id",
  CLASS : "class",
  WHITESPACE : "whitespace",
  IDENTIFIER : "identifier",
  COMMA : "comma",
  LARGER_THAN : "larger_than",
  PLUS : "plus",
  WAVY_LINE : "wavy_line",
}


class Tokenizer {
  getTokens(exp) {
    var idx = 0;
    var tokens = [];
    while (idx < exp.length) {
      var changed = false;
      tokenizers.forEach(t => {
        var ret = t.test(exp, idx)
        if (ret[0]) { // match()
          tokens.push(ret[1]);  
          idx += ret[0];
          changed = true;
        }
      })
      if (!changed && idx < exp.length) {
        throw "Incorrect format";
      }
    }
    return tokens;
  }
}

const NOT_FOUND = [0, null]

class CharTokenizer {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  test(input, idx) {
    return (input[idx] == this.value) ? [1, {type:this.type, value: this.value}] : NOT_FOUND;
  }
}

class IDTokenizer {
  constructor() {
    this.type = tokenType.ID;
  }
  
  test(input, idx) {
    var sub = input.slice(idx);
    var match = sub.match(ID_SELECTOR);
    if (match && match.index == 0) {
      return [match[0].length, {type:this.type, value: match[0]}]; 
    } else {
      return NOT_FOUND; 
    }
  }
}

class ClassTokenizer {
  constructor() {
    this.type = tokenType.CLASS;
  }
  
  test(input, idx) {
    var sub = input.slice(idx);
    var match = sub.match(CLASS_SELECTOR);
    if (match && match.index == 0) {
      return [match[0].length, {type: this.type, value: match[0]}]; 
    } else {
      return NOT_FOUND; 
    }
  }
}

class WhitespaceTokenizer {
  constructor() {
    this.type = tokenType.WHITESPACE;
  }
  
  test(input, idx) {
    var sub = input.slice(idx);
    var match = sub.match(WHITESPACE);
    if (match && match.index == 0) {
      return [match[0].length, {type: this.type, value: match[0]}]; 
    } else {
      return NOT_FOUND; 
    }
  }
}

class IdentifierTokenizer {
  constructor() {
    this.type = tokenType.IDENTIFIER;
  }
  
  test(input, idx) {
    var sub = input.slice(idx);
    var match = sub.match(IDENTIFIER);
    if (match && match.index == 0) {
      return [match[0].length, {type: this.type, value: match[0]}]; 
    } else {
      return NOT_FOUND; 
    }
  }
}

let tokenizers = [
  new IDTokenizer(),
  new IdentifierTokenizer(),
  new WhitespaceTokenizer(),
  new CharTokenizer(tokenType.GLOBAL, "*"),
  new CharTokenizer(tokenType.COMMA, ","),
  new CharTokenizer(tokenType.PLUS, "+"),
  new CharTokenizer(tokenType.WAVY_LINE, "~"),
  new CharTokenizer(tokenType.LARGER_THAN, ">"),
  new ClassTokenizer()
]

export {
  Tokenizer,
  tokenType
}
