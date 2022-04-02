import Combinator from './combinator';
import UnsupportedException from './unsupported_exception';
import {Tokenizer} from './tokenizer.js'
import Parser from './parser.js'

// Whitespace
const WHITESPACE = /(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))/
const HEX_DIGIT = /[A-Fa-f0-9]/
// CSS escapes
//const CSS_ESCAPES = `(?:\\(?:${HEX_DIGIT}{1,6}${WHITESPACE}?|[^\r\n\f]|$))`
const CSS_ESCAPES = /(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$))/
//const IDENTIFIER = `(?:(?:-?(?:[^\x00-\x2f\x30-\x40\x5B-\x5E\x60\x7B-\x9f]|${CSS_ESCAPES})+|--)(?:[^\x00-\x2c\x2e\x2f\x3A-\x40\x5B-\x5E\x60\x7B-\x9f]|${CSS_ESCAPES})*)`
const IDENTIFIER = /(?:(?:-?(?:[^\x00-\x2f\x30-\x40\x5B-\x5E\x60\x7B-\x9f]|(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$)))+|--)(?:[^\x00-\x2c\x2e\x2f\x3A-\x40\x5B-\x5E\x60\x7B-\x9f]|(?:\\(?:[A-Fa-f0-9]{1,6}(?:[ \t]|(?:\r\n|(?!\r\n)[\n\f\r]))?|[^\r\n\f]|$)))*)/

export default class Selector {
  
  constructor(adapter) {
    this.adapter = adapter;
    this.combinator = new Combinator(adapter)
    this.tokenizer = new Tokenizer()
    this.parser = new Parser()
  }

  select(exp, element) {
    var tokens = this.tokenizer.getTokens(exp);
    // console.debug(tokens)
    var selectors = this.parser.parseProgram(tokens)
    return this.parserSelect(selectors, element)  
  }

  parserSelect(obj, elements) {
    if (Array.isArray(elements)) {
      // console.debug('before: parserSelect', obj.type, 'candidate size: ', elements.length)
    }
    var selected = []
    if (obj.type == 'merge') {
      // preprocess to get all descendants
      var allCandidates = this.combinator.descendant([elements]);
      var selectedSet = new Set();
      obj.params.forEach(param => {
        var arr = this.parserSelect(param, allCandidates)
        arr.forEach(a => selectedSet.add(a));
      });
      selected = Array.from(selectedSet)
    } else if (obj.type == 'group') {
      selected = elements;
      obj.params.forEach(param => {
        selected = this.parserSelect(param, selected) 
      });
    } else if (obj.type == 'descendant') {
      selected = this.combinatorBinary(this.combinator.descendant.bind(this), elements, obj.params[0], obj.params[1])
    } else if (obj.type == 'child') {
      selected = this.combinatorBinary(this.combinator.child.bind(this), elements, obj.params[0], obj.params[1])
    } else if (obj.type == 'nextSibling') {
      selected = this.combinatorBinary(this.combinator.nextSibling.bind(this), elements, obj.params[0], obj.params[1])
    } else if (obj.type == 'subsequentSibling') {
      selected = this.combinatorBinary(this.combinator.subsequentSibling.bind(this), elements, obj.params[0], obj.params[1])
    } else if (obj.type == 'id') {
      selected = this.atomSelectorMatcher(new IDSelector(this.adapter), obj.value, elements);
    } else if (obj.type == 'class') {
      selected = this.atomSelectorMatcher(new ClassSelector(this.adapter), obj.value, elements);
    } else if (obj.type == 'identifier') {
      selected = this.atomSelectorMatcher(new IdentifierSelector(this.adapter), obj.value, elements);
    } else if (obj.type == 'global') {
      selected = elements;
    }
    //console.debug('after: parserSelect', obj.type, 'candidate size: ', selected.length)
    //console.debug(selected)
    return selected;
  }

  atomSelectorMatcher(selector, value, elements) {
    var selected = []
    elements.forEach(e => {
      if (selector.match(e, value)) {
        selected.push(e);
      }
    })
    return selected;
  }

  combinatorBinary(func, elements,  obj1, obj2) {
    var selected = this.parserSelect(obj1, elements);
    //console.debug("hahah", selected)
    selected = func(selected);
    return this.parserSelect(obj2, selected);
  }
}

// The AtomSelector is the "simple selector" defined in CSS3 https://www.w3.org/TR/selectors-3/#selectors
class AtomSelector {
  constructor(adapter) {
    this.adapter = adapter;
  }
} 

class IdentifierSelector extends AtomSelector {
  constructor(adapter) {
    super(adapter)
  }
 
  match(element, value) {
    return value == this.adapter.name(element);
  }
}

class AttributeSelector extends AtomSelector {
  constructor(adapter, expression) {
    super(adapter, expression)
    this.attr = null
    this.val = null
    this.processExpression(expression)
  }

  processExpression(expression) {
    var idx = expression.indexOf('[');
    expression = expression.slice(idx + 1)
    idx = expression.lastIndexOf(']');
    expression = expression.slice(0, idx)
    idx = expression.indexOf("=")
    if (idx > 0 && expression[idx - 1].match(/\w/) == null) {
      throw new UnsupportedException(expression.slice(idx - 1, idx + 1) + " is not supported")
    }
    if (idx < 0) { // [attr]
      this.attr = expression
    } else {
      this.attr = expression.slice(0, idx)
      this.val = expression.slice(idx + 1).replace(/\"/g, "")
    }
    this.expression = expression
  }

  match(element) {
    if (!this.adapter.isTagElement(element)) return false;
    if (this.val == null) {
      var attrs = this.adapter.attributes(element);
      if (!attrs) return false
      return this.attr in attrs
    }
    var attrs = this.adapter.attributes(element);
    if (!(this.attr in attrs)) return false;
    return attrs[this.attr] == this.val
  }

}

class ClassSelector extends AtomSelector {
  constructor(adapter) {
    super(adapter)
  }

  match(element, value) {
    var c = this.adapter.attributes(element).class;
    if (!c) return false;
    var classes = c.split(" ")
    return classes.indexOf(value) >= 0;
  }
}

class IDSelector extends AtomSelector {
  constructor(adapter) {
    super(adapter)
  }

  match(element, value) {
    return value == this.adapter.attributes(element).id;
  }
}

class PseudoClassSelector extends AtomSelector {
  constructor(adapter) {
    super(adapter)
  }

  match(element) {
    //return expression == adapter.name(element);
  }

}
