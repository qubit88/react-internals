React = {
  //  accepts html tag or function(class) as a first argument and optional second and third arguments (chilren might be a property in second or as a third argument)
  //  returns object
  createElement(type, props = {}, children) {
    return {
      type,
      props: children ? { ...props, children } : props
    };
  },

  // creates class component; accepts object wihh render method
  createClass(spec) {
    return class ClassComponent {
      constructor(props) {
        this.props = props;

        for (let method in spec) {
          this[method] = spec[method];
        }
      }

      render() {
        return spec.render(this.props);
      }
    };
  },

  render(element, container) {
    let instance = new CompositeComponent(element);
    React.Reconciler.mount(instance, container);
  },

  Reconciler: {
    mount(instance, container) {

    }
  }
};

//accepts element object; creates class component and passes props; calls render method on class component
function CompositeComponent(component) {
  this.component = component;

  if (typeof this.component.type !== "string") {
    this.component = new this.component.type(this.component.props).render();
  }

  else {
    this.component = new this.component.type
  }

  this.domElement = DomComponent(this.component);


  this.mount = (container) => {

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

    domElement.setAttribute("style", value);
  }

  if (props.children) {
    const textNode = document.createTextNode(props.children);
    domElement.appendChild(textNode);
  }

  this.mount(container) {
    container.appendChild(this.domElement);
  }
  
}

const Header = React.createClass({
  render(props) {
    return React.createElement("h1", props);
  }
});

const boldSpan = React.createClass({
  render(props) {
    return React.createElement("span", props);
  }
});

const Footer = React.createClass({
  render(props) {
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
