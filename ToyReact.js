class ElementWrapper {
  constructor(type) {
    // this.root = document.createElement(type)
    this.type = type
    this.props = Object.create(null)
    this.children = []
  }
  setAttribute(name, value) {
    // if (name.match(/^on([\s\S]+)$/)) {
    //   let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
    //   this.root.addEventListener(eventName, value)
    // } else {
    //   if (name === 'className') {
    //     name = 'class'
    //   }
    //   this.root.setAttribute(name, value)
    // }
    this.props[name] = value
  }
  appendChild(vchild) {
    this.children.push(vchild)
    // console.log('ElementWrapper appendChild', vchild)
    // let range = document.createRange()
    // if (this.root.children.length) {
    //     range.setStartAfter(this.root.lastChild)
    //     range.setEndAfter(this.root.lastChild)
    // } else {
    //     range.setStart(this.root, 0)
    //     range.setEnd(this.root, 0)
    // }
    // vchild.mountTo(range)
  }
  mountTo(range) {
    this.range = range
    let element = document.createElement(this.type)
    for (let name in this.props) {
      let value = this.props[name]
      if (name.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase())
        element.addEventListener(eventName, value)
      } else {
        if (name === 'className') {
          name = 'class'
        }
        element.setAttribute(name, value)
      }
    }
    for (let child of this.children) {
      let range = document.createRange()
      if (element.children.length) {
        range.setStartAfter(element.lastChild)
        range.setEndAfter(element.lastChild)
      } else {
        range.setStart(element, 0)
        range.setEnd(element, 0)
      }
      child.mountTo(range)
    }
    range.insertNode(element)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
    this.type = '#text'
    this.children = []
    this.props = Object.create(null)
  }
  mountTo(range) {
    this.range = range
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.children = []
    this.props = Object.create(null)
  }
  get type() {
    return this.constructor.name
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  mountTo(range) {
    this.range = range
    this.update()
  }
  update() {
    // console.log('update', this.range)
    // let placeholder = document.createComment('placeholder')
    // let range = document.createRange()
    // range.setStart(this.range.endContainer, this.range.endOffset)
    // range.setEnd(this.range.endContainer, this.range.endOffset)
    // range.insertNode(placeholder)
    // this.range.deleteContents()

    let vdom = this.render()
    if (this.vdom) {
      console.log('old:', this.vdom)
      console.log('new:', vdom)
      let isSameNode = (node1, node2) => {
        if (node1.type !== node2.type) {
          return false
        }
        if (node1.children.length !== node2.children.length) {
          return false
        }
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameNode(node1.children[i], node2.children[i])) {
            return false
          }
        }
        if (
          Object.keys(node1.props).length !== Object.keys(node2.props).length
        ) {
          return false
        }
        for (let name in node1.props) {
          let props1 = node1.props[name]
          let props2 = node2.props[name]
          if (
            typeof props1 === 'function' &&
            typeof props2 === 'function' &&
            props1.toString() === props2.toString()
          ) {
            continue
          }
          if (
            typeof props1 === 'object' &&
            typeof props2 === 'object' &&
            JSON.stringify(props1) === JSON.stringify(props2)
          ) {
            continue
          }

          if (props1 !== props2) {
            return false
          }
        }
      }

      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false
        }
        if (node1.children.length !== node1.children.length) {
          return false
        }
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameNode(node1.children[i], node2.children[i])) {
            return false
          }
        }
      }
      let raplace = (newTree, oldTree) => {
        if (isSameTree(newTree, oldTree)) {
          return
        }
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range)
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i])
          }
        }
      }
      raplace(vdom, this.vdom)
    } else {
      vdom.mountTo(this.range)
    }
    this.vdom = vdom
    // placeholder && placeholder.parentNode.removeChild(placeholder)
  }
  appendChild(vchild) {
    console.log('Component appendChild', vchild)
    this.children.push(vchild)
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === 'object' && newState[p] !== null) {
          if (typeof oldState[p] !== 'object') {
            if (newState[p] instanceof Array) {
              oldState[p] = []
            } else {
              oldState[p] = {}
            }
          }
          merge(oldState[p], newState[p])
        } else {
          oldState[p] = newState[p]
        }
      }
    }
    if (!this.state) {
      this.state = {}
    }
    merge(this.state, state)
    this.update()
  }
}

export let ToyReact = {
  createElement(type, attributes, ...children) {
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
          if (child === null || child === void 0) child = ''
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
    let range = document.createRange()
    if (element.children.length) {
      range.setStartAfter(element.lastChild)
      range.setEndAfter(element.lastChild)
    } else {
      range.setStart(element, 0)
      range.setEnd(element, 0)
    }
    vdom.mountTo(range)
  }
}
