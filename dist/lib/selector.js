"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DESCENDANT_STATE = 0;

var Selector = /*#__PURE__*/function () {
  function Selector(adapter) {
    _classCallCheck(this, Selector);

    this.adapter = adapter;
    this.simleSelector = new SimpleSelector(adapter);
    this.combinator = new Combinator(adapter);
  }

  _createClass(Selector, [{
    key: "select",
    value: function select(expression, element) {
      var _this = this;

      // handle groups of selectors
      var expressions = this.groupSelectorExpressionSplit(expression);
      var selectedElements = [];
      expressions.forEach(function (e) {
        selectedElements.append(_this.nonGroupSelect(expression, element));
      });
      return selectedElements;
    }
  }, {
    key: "nonGroupSelect",
    value: function nonGroupSelect(expression, element) {
      var selectedElements = [];
      var candidates = [element];
      var start = 0;
      var idx = 0;
      var nonDecendantCompositorstate = DESCENDANT_STATE;
      var pivotLetter = 0;

      while (idx < expression.length) {
        switch (expression[idx]) {
          case '>':
            combinatorSlice(expression.slice(start, idx), expression[idx], candidates);
            pivotLetter = expression[idx];
            start = idx + 1;
            break;

          case '+':
            combinatorSlice(expression.slice(start, idx), expression[idx], candidates);
            pivotLetter = expression[idx];
            start = idx + 1;
            break;

          case '~':
            combinatorSlice(expression.slice(start, idx), expression[idx], candidates);
            pivotLetter = expression[idx];
            start = idx + 1;
            break;

          case '[':
          case '(':
            pivotLetter = expression[idx];
            break;

          case ']':
          case ')':
            pivotLetter = 0;
            break;

          case expression[idx].match(/\s/) && expression[idx + 1].match(/[a-zA-Z]/):
            if (pivotLetter == 0) {
              combinatorSlice(expression.slice(start, idx), expression[idx], candidates);
              pivotLetter = expression[idx];
              start = idx + 1;
            } else if (pivotLetter.match(/[\[\(]/) == null) {
              pivotLetter = 0;
            }

            break;

          default:
            break;
        }

        ++idx;
      }
    }
  }, {
    key: "combinatorSlice",
    value: function combinatorSlice(expr, letter, candidates) {
      var _this2 = this;

      var selected = [];
      candidates.forEach(function (c) {
        selected = selected.concat(_this2.simpleSelector.select(expr, c));
      });

      switch (letter) {
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
          candidates = this.combinator.decendant(selected);
          break;
      }

      return candidates;
    }
  }, {
    key: "groupSelectorExpressionSplit",
    value: function groupSelectorExpressionSplit(expression) {
      return expression.split(",");
    }
  }]);

  return Selector;
}(); // The simple selector here is the "sequence of simple selectors" defined in CSS3 https://www.w3.org/TR/selectors-3/#selector-syntax


exports["default"] = Selector;

var SimpleSelector = /*#__PURE__*/function () {
  function SimpleSelector(adapter) {
    _classCallCheck(this, SimpleSelector);

    this.adapter = adapter;
  }

  _createClass(SimpleSelector, [{
    key: "select",
    value: function select(expression, element) {
      console.log(expression, element);
    }
  }]);

  return SimpleSelector;
}(); // The AtomSelector is the "simple selector" defined in CSS3 https://www.w3.org/TR/selectors-3/#selectors


var AtomSelector = /*#__PURE__*/function () {
  function AtomSelector(adapter) {
    _classCallCheck(this, AtomSelector);

    this.adapter = adapter;
  }

  _createClass(AtomSelector, [{
    key: "typeSelector",
    value: function typeSelector(expression, element) {
      return express == adapter.name(element);
    }
  }, {
    key: "universalSelector",
    value: function universalSelector(expression, element) {
      //TODO check element type
      return true;
    }
  }, {
    key: "attributeSelector",
    value: function attributeSelector(expression, element) {}
  }, {
    key: "classSelector",
    value: function classSelector(expression, element) {}
  }, {
    key: "idSelector",
    value: function idSelector(expression, element) {}
  }, {
    key: "pseudoClassSelector",
    value: function pseudoClassSelector(expression, element) {}
  }]);

  return AtomSelector;
}();