import { ToyReact, Component } from './ToyReact.js'
class MyComponent extends Component {
  render() {
    return (
      <div>
        <span>hi</span>
        <span>di</span>
        <span>lao</span>
        {this.children}
      </div>
    )
  }
}

let a = (
  <MyComponent name="a" id="test">
    <div>123</div>
  </MyComponent>
)
ToyReact.render(a, document.body)
