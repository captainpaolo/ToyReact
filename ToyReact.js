class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(vchild) {
    console.log('appendChild', vchild)
    vchild.mountTo(this.root)
  }
  mountTo(parent) {
    console.log('mountTo', parent)
    parent.appendChild(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  mountTo(parent) {
    console.log('mountTo', parent)
    parent.appendChild(this.root)
  }
}

export class Component {
  constructor() {
    this.children = []
  }
  setAttribute(name, value) {
    this[name] = value
  }
  mountTo(parent) {
    let vdom = this.render()
    vdom.mountTo(parent)
  }
  appendChild(vchild) {
    this.children.push(vchild)
  }
}

export let ToyReact = {
  createElement(type, attributes, ...children) {
    console.log('createElement', arguments)
    let element
    if (typeof type === 'string') {
      element = new ElementWrapper(type)
    } else {
      element = new type()
    }
    for (let name in attributes) {
      element.setAttribute(name, attributes[name])
    }
    // for (let child of children) {
    //   if (typeof child === 'string') child = new TextWrapper(child)
    //   element.appendChild(child)
    // }
    let inserChild = children => {
      for (let child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          inserChild(child)
        } else {
          if (
            !child instanceof Component &&
            !child instanceof ElementWrapper &&
            !child instanceof TextWrapper
          ) {
            child = String(child)
          }
          if (typeof child === 'string') {
            child = new TextWrapper(child)
          }
          element.appendChild(child)
        }
      }
    }
    inserChild(children)
    return element
  },
  render(vdom, element) {
    console.log('render----------', vdom, element)
    vdom.mountTo(element)
  }
}
