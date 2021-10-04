"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Combinator = /*#__PURE__*/function () {
  function Combinator(adapter) {
    _classCallCheck(this, Combinator);

    this.adapter = adapter;
  }

  _createClass(Combinator, [{
    key: "descendant",
    value: function descendant(elements) {
      var _this = this;

      var dict = new Set();
      elements.forEach(function (e) {
        _this.adapter.decendants(e).forEach(function (d) {
          return dict.add(d);
        });
      });
      return Array.from(dict);
    }
  }, {
    key: "child",
    value: function child(elements) {
      var _this2 = this;

      var children = [];
      elements.forEach(function (e) {
        children = children.concat(_this2.adapter.children(e));
      });
      return children;
    }
  }, {
    key: "nextSibling",
    value: function nextSibling(elements) {
      var _this3 = this;

      var siblings = [];
      elements.forEach(function (e) {
        siblings.append(_this3.adapter.nextSibling(e));
      });
      return siblings;
    }
  }, {
    key: "subsequentSibling",
    value: function subsequentSibling(elements) {
      var _this4 = this;

      var siblings = [];
      elements.forEach(function (e) {
        siblings = siblings.concat(_this4.adapter.nextSiblings(e));
      });
      return siblings;
    }
  }]);

  return Combinator;
}();

exports["default"] = Combinator;