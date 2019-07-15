React = {
  //  accepts html tag or function(class) as a first argument and optional second and third arguments (chilren might be a property in second or as a third argument)
  //  returns object
  createElement(type, props = {}, children) {
    return {
      type,
      props: children ? { ...props, children } : props
    };
  },

  // creates class component; accepts objects methods
  createClass(spec) {
    return class ClassComponent {
      constructor(props) {
        this.props = props;

        for (let method in spec) {
          this[method] = spec[method];
        }
      }
    };
  },

  render(element, container) {
    // wraps object returned by createElement in constructor function to have same signature as Class Component (call render)
    function wrapper() {
      this.render = () => {
        return element;
      };
    }

    wrappedElement = React.createElement(wrapper);

    let instance = new CompositeComponent(wrappedElement);
    React.Reconciler.mount(instance, container);
  },

  // calls mount method of instances of either DomComponent or CompositeComponent

  Reconciler: {
    mount(instance, container) {
      return instance.mount(container);
    }
  }
};

//accepts element object; creates class component and passes props; calls render method on class component
function CompositeComponent(component) {
  this.component = component;

  // returns instances of DomComponent or CompositeComponent

  this._compositeMount = instance => {
    let el = instance.render();

    if (typeof el.type === "string") {
      return new DomComponent(el);
    }

    return new CompositeComponent(el);
  };

  this.mount = container => {
    this.instance = new this.component.type(this.component.props);

    if (this.instance.componentWillMount) {
      this.instance.componentWillMount();
    }
    this.element = this._compositeMount(this.instance);

    React.Reconciler.mount(this.element, container);

    if (this.instance.componentDidMount) {
      this.instance.componentDidMount();
    }
  };
}

// creates html element
function DomComponent({ type, props }) {
  this.domElement = document.createElement(type);

  if (props.style) {
    //convert props' values to string to style dom element
    let value = "";
    Object.entries(props.style).forEach(el => {
      value += `${el[0]}:${el[1]};`;
    });

    this.domElement.setAttribute("style", value);
  }

  if (props.children) {
    const textNode = document.createTextNode(props.children);
    this.domElement.appendChild(textNode);
  }

  this.mount = container => {
    container.appendChild(this.domElement);
  };
}

const Header = React.createClass({
  componentWillMount() {
    console.log("I will mount now");
  },
  render() {
    return React.createElement("h1", this.props);
  }
});

const boldSpan = React.createClass({
  render() {
    return React.createElement("span", this.props);
  }
});

const Footer = React.createClass({
  render() {
    return React.createElement(
      boldSpan,
      { style: { color: "orange", "font-weight": "bold" } },
      "I'm span in footer"
    );
  }
});

React.render(
  React.createElement(Header, { style: { color: "red" } }, "I'm header"),
  document.querySelector("#root")
);

React.render(
  React.createElement("p", null, "I'm paragraph"),
  document.querySelector("#root")
);

React.render(React.createElement(Footer), document.querySelector("#root"));
