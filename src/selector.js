import Combinator from './combinator';
import UnsupportedException from './unsupported_exception';

export default class Selector {
  
  constructor(adapter) {
    this.adapter = adapter;
    this.simpleSelector = new SimpleSelector(adapter);
    this.combinator = new Combinator(adapter)
  }


  select(expression, element) {
    // handle groups of selectors
    var expressions = this.groupSelectorExpressionSplit(expression)  
    console.log(expressions)
    var selectedElements = [] 
    expressions.forEach(e => {
      selectedElements = selectedElements.concat(this.nonGroupSelect(e, element))
    }) 
    return selectedElements
  }

  nonGroupSelect(expression, element) {
    expression = expression.trim()
    console.log("nonGroupSelect")
    console.log(expression)
    var selectedElements = []
    // get all descendants as candidates
    var candidates = this.adapter.descendants(element);
    var start = 0;
    var idx = 0;
    var pivotLetter = 0;
    while (idx < expression.length) {
      var c = expression[idx]
      if (c == '>') {
          candidates = this.combinatorSlice(expression.slice(start, idx), expression[idx], candidates)
          pivotLetter = expression[idx];
          start = idx + 1;
      } else if (c == '+') {
          candidates = this.combinatorSlice(expression.slice(start, idx), expression[idx], candidates)
          pivotLetter = expression[idx];
          start = idx + 1;
      } else if (c == '~') {
          candidates = this.combinatorSlice(expression.slice(start, idx), expression[idx], candidates)
          pivotLetter = expression[idx];
          start = idx + 1;
      } else if (c == '[' || c == '(') {
          pivotLetter = expression[idx]
      } else if (c == ']' || c == ')') {
          pivotLetter = 0;
      } else if (c.match(/\s/) && expression[idx+1].match(/[a-zA-Z#.\[:]/)) { 
          if (pivotLetter == 0) {
            candidates = this.combinatorSlice(expression.slice(start, idx), expression[idx], candidates)
            pivotLetter = expression[idx];
            start = idx + 1;
          } else if ("[(".indexOf(pivotLetter) >= 0) {
            pivotLetter = 0; 
          }
      }
      ++idx;
    }
    if (start < idx && expression.slice(start, idx).trim().length > 0) {
      candidates = this.combinatorSlice(expression.slice(start, idx), 0, candidates) 
    }
    return candidates;
  }

  combinatorSlice(expr, letter, candidates) {
    console.log("combinatorSlice:", expr, letter)
    expr = expr.trim()
    var selected = []
    candidates.forEach(c => {
      if (this.simpleSelector.match(expr, c)) {
        selected.push(c);
      }
    })
    switch(letter) {
      case '>':
        candidates = this.combinator.child(selected);
        break;
      case '+':
        candidates = this.combinator.nextSibling(selected);
        break;
      case '~':
        candidates = this.combinator.subsequentSibling(selected);
        break;
      case ' ':
        candidates = this.combinator.descendant(selected);
        break;
      default:
        candidates = selected;
        break;
    }
    console.log("selected:", selected.length, "candidates:", candidates.length)
    return candidates 
  }

  groupSelectorExpressionSplit(expression) {
    return expression.split(",");
  }
  
}

// The simple selector here is the "sequence of simple selectors" defined in CSS3 https://www.w3.org/TR/selectors-3/#selector-syntax
class SimpleSelector {
  
  constructor(adapter) {
    this.adapter = adapter;
  }

  match(expression, element) {
    var expressions = this.atomExpressionSplit(expression);
    console.log(expressions)
    var candidates = []
    var isMatch = true;
    for (var i = 0; i < expressions.length; ++i) {
      isMatch = expressions[i].match(element);
      if (!isMatch) {
        break;
      }
    }
  
    if (isMatch) {
      console.log("************!!!", element.name, element.attrs, isMatch)
    }
    return isMatch;
  }

  atomExpressionSplit(expression) {
    var expressions = []
    var last = 0;
    for (var i = 0; i < expression.length; ++i) {
      var c = expression.charAt(i)
      if (c == '*') {//universal selector
        expressions.push(new UniversalSelector(this.adapter, expr));
      } else if (c.match(/[a-zA-Z]/g)) {
        var expr = this.getNext(expression, i)
        expressions.push(new TypeSelector(this.adapter, expr))
        i = i + expr.length - 1
      } else if (c == '[') {// beginning of atrribute selector
        var end = expression.indexOf("]", i);
        expressions.push(new AttributeSelector(this.adapter, expression.slice(i, end + 1)));
        i = end;
      } else if (c == ':') {// pseudo-class selector
        var sub = expression.slice(i);
        var end = sub.search(/\W/);
        if (sub[end] == '(') {
          end = sub.indexOf(")", end)
        }
        expressions.push(new PseudoClassSelector(this.adapter, expression.slice(i, i + end).trim()))
        i = end - 1
      } else if (c == '.') {// class selector
        var expr = this.getNext(expression, i)
        expressions.push(new ClassSelector(this.adapter, expr))
        i = i + expr.length - 1
      } else if (c == '#') {// ID selector
        var expr = this.getNext(expression, i)
        expressions.push(new IDSelector(this.adapter, expr))
        i = i + expr.length - 1
      }
    }
    return expressions
  }
  
  getNext(expression, start) {
    var sub = expression.slice(start + 1);
    var end = sub.search(/\W/g); // end is index of sub
    if (end == -1) {
      end = sub.length
    }
    return expression.slice(start, start + end + 1).trim()
  }
}

// The AtomSelector is the "simple selector" defined in CSS3 https://www.w3.org/TR/selectors-3/#selectors
class AtomSelector {
  constructor(adapter, expression) {
    this.adapter = adapter;
    this.expression = expression;
  }
} 

class UniversalSelector extends AtomSelector {
  constructor(adapter, expression) {
    super(adapter, expression)
  }

  match(element) {
    return this.adapter.isValidElement(element)
  }
} 

class TypeSelector extends AtomSelector {
  constructor(adapter, expression) {
    super(adapter, expression)
  }
 
  match(element) {
    if (!this.adapter.isValidElement(element)) return false;
    return this.expression == this.adapter.name(element);
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
    if (!this.adapter.isValidElement(element)) return false;
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
  constructor(adapter, expression) {
    super(adapter, expression)
    this.processExpression(expression)
  }

  processExpression(expression) {
    var idx = expression.indexOf('.');
    this.expression = expression.slice(idx + 1)
  }

  match(element) {
    if (!this.adapter.isValidElement(element)) return false;
    var c = this.adapter.attributes(element).class;
    if (!c) return false;
    var classes = c.split(" ")
    return classes.indexOf(this.expression) >= 0;
  }

}

class IDSelector extends AtomSelector {
  constructor(adapter, expression) {
    super(adapter, expression)
    this.processExpression(expression)
  }

  processExpression(expression) {
    var idx = expression.indexOf('#');
    this.expression = expression.slice(idx + 1)
  }

  match(element) {
    if (!this.adapter.isValidElement(element)) return false;
    //TODO: ID validation
    return this.expression == this.adapter.attributes(element).id;
  }

}

class PseudoClassSelector extends AtomSelector {
  constructor(adapter, expression) {
    super(adapter, expression)
  }

  match(element) {
    if (!this.adapter.isValidElement(element)) return false;
    //return expression == adapter.name(element);
  }

}
