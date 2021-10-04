
export default class Combinator {
  constructor(adapter) {
    this.adapter = adapter;
  }

  descendant(elements) {
    var dict = new Set() 
    elements.forEach(e => {
      this.adapter.descendants(e).forEach(d => dict.add(d)) 
    })
    return Array.from(dict); 
  }

  child(elements) {
    var children = []
    elements.forEach(e => {
      children = children.concat(this.adapter.children(e))
    })
    return children; 
  }

  nextSibling(elements) {
    var siblings = []
    elements.forEach(e => {
      siblings.append(this.adapter.nextSibling(e))
    })
    return siblings; 
  }

  subsequentSibling(elements) {
    var siblings = []
    elements.forEach(e => {
      siblings = siblings.concat(this.adapter.nextSiblings(e))
    })
    return siblings; 
  }
}
