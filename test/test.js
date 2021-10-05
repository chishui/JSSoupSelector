const assert = require('assert');
import SoupSelector from '../src/selector';
import JSSoupAdapter from '../src/adapters/jssoup_adapter';
var JSSoup = require('jssoup').default;

const data = `
  <html><head><title>The Dormouse's story</title></head>
  <body>
  <p class="title"><b>The Dormouse's story</b></p>
  <p title="tt1">title1</p>
  <p title="tt2">title2</p>
  <p class="story">Once upon a time there were three little sisters; and their names were
  <a href="http://example.com/elsie" class="sister" id="link1">Elsie</a>,
  <a href="http://example.com/lacie" class="sister" id="link2">Lacie</a> and
  <a href="http://example.com/tillie" class="sister" id="link3">Tillie</a>;
  and they lived at the bottom of a well.</p>

  <p class="story">...</p>

  <span class="one" id="id1">One</span>
  <span class="two" id="id2">Two</span>
  <span class="three" id="id3" title2="title">Three</span>
  <span class="one two three" id="id4">One Two Three</span>

  <div class=" whitespace">Whitespace Left</div>
  <div class="whitespace ">Whitespace Right</div>
  <div class=" whitespace ">Whitespace Left and Right</div>
  <div class="    so    much    whitespace    ">Whitespace</div>

  </body>
  </html>
`;



describe('should work well for atomic selector', function() {
  describe('universal selector', function() {
    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var p = soup.find("p", "title") 
      var b = ss.select("*", p)
      assert.equal(1, b.length);
      assert.equal("b", b[0].name);
    });
  });

  describe('type selector', function() {
    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("span", soup)
      assert.equal(4, b.length);
      assert.equal("One", b[0].text);
      assert.equal("Two", b[1].text);
      assert.equal("Three", b[2].text);
      assert.equal("One Two Three", b[3].text);
    });
  });

  describe('class selector', function() {
    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select(".one", soup)
      assert.equal(2, b.length);
      assert.equal("One", b[0].text);
      assert.equal("One Two Three", b[1].text);
    });
  });

  describe('ID selector', function() {
    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("#id1", soup)
      assert.equal(1, b.length);
      assert.equal("One", b[0].text);
    });
  });

  describe('attribute selector', function() {
    it('should be OK without value', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("[title]", soup)
      assert.equal(2, b.length);
      assert.equal("title1", b[0].text);
      assert.equal("title2", b[1].text);
    });

    it('should be OK with value', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("[title=tt1]", soup)
      assert.equal(1, b.length);
      assert.equal("title1", b[0].text);
    });

    it('should be OK with value wrapped in quotes', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("[title=\"tt1\"]", soup)
      assert.equal(1, b.length);
      assert.equal("title1", b[0].text);
    });
  });
});

describe('should work well for simple selector', function() {
  describe('universal selector', function() {
    it('should be OK with class selector', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var u_b = ss.select("*.one", soup)
      var b = ss.select(".one", soup)
      assert.equal(u_b.length, b.length);
      assert.equal(u_b[0].text, b[0].text);
      assert.equal(u_b[1].text, b[1].text);
    });

    it('should be OK with ID selector', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var u_b = ss.select("*#id1", soup)
      var b = ss.select("#id1", soup)
      assert.equal(u_b.length, b.length);
      assert.equal(u_b[0].text, b[0].text);
    });

    it('should be OK with attribute selector', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var u_b = ss.select("*[title=tt1]", soup)
      var b = ss.select("[title=tt1]", soup)
      assert.equal(u_b.length, b.length);
      assert.equal(u_b[0].text, b[0].text);
    });
  });

  describe('type selector', function() {
    it('should be OK with class selector', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var u_b = ss.select("span.one", soup)
      var b = ss.select(".one", soup)
      assert.equal(u_b.length, b.length);
      assert.equal(u_b[0].text, b[0].text);
      assert.equal(u_b[1].text, b[1].text);
    });

    it('should be OK with ID selector', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var u_b = ss.select("span#id1", soup)
      var b = ss.select("#id1", soup)
      assert.equal(u_b.length, b.length);
      assert.equal(u_b[0].text, b[0].text);
    });

    it('should be OK with attribute selector', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var u_b = ss.select("p[title=tt1]", soup)
      var b = ss.select("[title=tt1]", soup)
      assert.equal(u_b.length, b.length);
      assert.equal(u_b[0].text, b[0].text);
    });
  });

  describe('chain selector', function() {
    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("span.one.two.three", soup)
      assert.equal(1, b.length);
      assert.equal("One Two Three", b[0].text);
    });

    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("span#id1.one", soup)
      assert.equal(1, b.length);
      assert.equal("One", b[0].text);
    });

    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("span[title2]#id3.three", soup)
      assert.equal(1, b.length);
      assert.equal("Three", b[0].text);
    });
  });
});

describe('should work well for selector', function() {
  describe('group selector', function() {
    it('should be OK', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("span#id1, p[title=\"tt1\"]", soup)
      assert.equal(2, b.length);
      assert.equal("One", b[0].text);
      assert.equal("title1", b[1].text);
    });
  });

  describe('combinator', function() {
    it('should be OK with descendant combinator', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("body span#id1", soup)
      assert.equal(1, b.length);
      assert.equal("One", b[0].text);
    });

    it('should be OK with descendant combinator', function() {
      var ss = new SoupSelector(new JSSoupAdapter());
      var soup = new JSSoup(data);
      var b = ss.select("body span #id1", soup)
      assert.equal(0, b.length);
    });
  });
});


