
export default class JSSoupAdapter {
  
  findAll(domElement, tagName) {
    return domElement.findAll(tagName);
  }

  descendants(domElement) {
    return domElement.descendants
  }
  
  children(domElement) {
    return domElement.contents;
  }
  
  nextSibling(domElement) {
    return domElement.nextSibling;
  }

  nextSiblings(domElement) {
    return domElement.nextSiblings;
  }

  elementName(domElement) {
    return domElement.name;
  }

  attributes(domElement) {
    return domElement.attrs
  }
  
  name(domElement) {
    return domElement.name
  }
}
