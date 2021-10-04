const assert = require('assert');
var expect = require('chai').expect;
import SoupSelector from '../src/selector';
import JSSoupAdapter from '../src/adapters/jssoup_adapter';
var JSSoup = require('jssoup').default;

const data = `
  <html><head><title>The Dormouse's story</title></head>
  <body>
  <p class="title"><b>The Dormouse's story</b></p>

  <p class="story">Once upon a time there were three little sisters; and their names were
  <a href="http://example.com/elsie" class="sister" id="link1">Elsie</a>,
  <a href="http://example.com/lacie" class="sister" id="link2">Lacie</a> and
  <a href="http://example.com/tillie" class="sister" id="link3">Tillie</a>;
  and they lived at the bottom of a well.</p>

  <p class="story">...</p>

  <span class="one">One</span>
  <span class="two">Two</span>
  <span class="three">Three</span>
  <span class="one two three">One Two Three</span>

  <div class=" whitespace">Whitespace Left</div>
  <div class="whitespace ">Whitespace Right</div>
  <div class=" whitespace ">Whitespace Left and Right</div>
  <div class="    so    much    whitespace    ">Whitespace</div>

  </body>
  </html>
`;



describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select(" body p > b", soup)
      assert.equal(1, b.length);
      console.log(b[0].length)
      assert.equal("The Dormouse's story", b[0].string);
    });
  });
});
