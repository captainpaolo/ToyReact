import { ToyReact, Component } from './ToyReact.js'
class MyComponent extends Component {
  render() {
    return (
      <div>
        <span>hi</span>
        <span>di</span>
        <span>lao</span>
      </div>
    )
  }
}

let a = <MyComponent name="a" id="test"></MyComponent>
ToyReact.render(a, document.body)
