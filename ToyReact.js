class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
      this.root.addEventListener(eventName, value);
    }
    if (name === 'className') {
      name = 'class';
    }
    this.root.setAttribute(name, value)

  }
  appendChild(vchild) {
    console.log('ElementWrapper appendChild', vchild)
    vchild.mountTo(this.root)
  }
  mountTo(parent) {
    console.log('ElementWrapper mountTo', parent)
    parent.appendChild(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
  mountTo(parent) {
    console.log('TextWrapper mountTo', parent)
    parent.appendChild(this.root)
  }
}

export class Component {
  constructor() {
    this.children = []
    this.props = Object.create(null);
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  mountTo(parent) {
    console.log('Component mountTo', parent)
    let vdom = this.render()
    vdom.mountTo(parent)
  }
  appendChild(vchild) {
    console.log('Component appendChild', vchild)
    this.children.push(vchild)
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === 'object') {
          if (typeof oldState[p] !== 'object') {
            oldState[p] = {};
          }
          merge(oldState[p], newState[p])
        } else {
          oldState[p] = newState[p]
        }
      }
    }
    if (!this.state) {
      this.state = {};
    }
    merge(this.state, state);
    console.log(this.state);
  }
}

export let ToyReact = {
  createElement(type, attributes, ...children) {
    console.log('createElement type', type)
    console.log('createElement attributes', attributes)
    console.log('createElement children', children)

    let element
    if (typeof type === 'string') {
      element = new ElementWrapper(type)
    } else {
      element = new type()
    }
    for (let name in attributes) {
      element.setAttribute(name, attributes[name])
    }
    let inserChild = children => {
      for (let child of children) {
        if (typeof child === 'object' && child instanceof Array) {
          inserChild(child)
        } else {
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper)
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
    console.log('----------render----------', vdom, element)
    vdom.mountTo(element)
  }
}