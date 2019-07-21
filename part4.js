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

        this.state = this.setInitialState ? this.setInitialState() : {};
      }

      setState(stateUpdate) {
        const internalInstance = React.InstanceMap.get(this);

        internalInstance._stateUpdate = internalInstance._stateUpdate || [];

        internalInstance._stateUpdate.push(stateUpdate);

        if (!internalInstance.rendering) {
          React.Reconciler.updateState(internalInstance);
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

    const prevRenderedComponent = container._prevRendredComponent;

    if (prevRenderedComponent) {
      React.updatePreviousComponent(prevRenderedComponent, element);
    } else {
      React.renderNewComponent(wrappedElement, container);
    }
  },

  updatePreviousComponent(prevRenderedComponent, newComponent) {
    React.Reconciler.update(prevRenderedComponent, newComponent);
  },

  renderNewComponent(newElement, container) {
    let instance = new CompositeComponent(newElement);
    React.Reconciler.mount(instance, container);
    container._prevRendredComponent = instance.renderedElement;
  },

  // calls mount method of instances of either DomComponent or CompositeComponent

  Reconciler: {
    mount(instance, container) {
      return instance.mount(container);
    },
    update(prevRenderedComponent, nextElement) {
      prevRenderedComponent.update(nextElement);
    },
    updateState(internalInstance) {
      internalInstance.updateState();
    }
  },

  InstanceMap: {
    set(key, value) {
      key._internalInstance = value;
    },
    get(key) {
      return key._internalInstance;
    }
  }
};

//accepts element object; creates class component and passes props; calls render method on class component
function CompositeComponent(component) {
  this._currentElement = component;

  // returns instances of DomComponent or CompositeComponent

  this._compositeMount = instance => {
    let el = instance.render();

    if (typeof el.type === "string") {
      return new DomComponent(el);
    }

    return new CompositeComponent(el);
  };

  this.mount = container => {
    this._instance = new this._currentElement.type(this._currentElement.props);

    React.InstanceMap.set(this._instance, this);

    if (this._instance.componentWillMount) {
      this._instance.componentWillMount();
    }
    this.renderedElement = this._compositeMount(this._instance);

    React.Reconciler.mount(this.renderedElement, container);

    if (this._instance.componentDidMount) {
      this._instance.componentDidMount();
    }
  };

  this.updateState = () => {
    this.update(this._currentElement);
  };

  this.update = newElement => {
    this.rendering = true;
    const nextProps = newElement.props;

    const willReceiveProps = this._currentElement !== newElement;

    if (willReceiveProps && this._instance.componentWillReceiveProps) {
      this._instance.componentWillReceiveProps(nextProps);
    }

    let shouldUpdate = true;

    const nextState = this._getNextState();

    if (this._instance.shouldComponentUpdate) {
      shouldUpdate = this._instance.shouldComponentUpdate(nextProps, nextState);
    }

    this._instance.props = nextProps;
    this._instance.state = nextState;

    if (shouldUpdate) {
      let newRendredElement = this._instance.render();
      this._currentElement = newElement;
      React.Reconciler.update(this.renderedElement, newRendredElement);
    }
    this.rendering = false;
  };
  this._getNextState = () => {
    if (!this._stateUpdate) {
      return this._instance.state;
    }

    let nextState = this._stateUpdate.reduce(
      (acc, state) => ({ ...acc, ...state }),
      this._instance.state
    );

    this._stateUpdate = null;
    return nextState;
  };
}

// creates html element
function DomComponent(element) {
  this._currentElement = element;

  let { type, props } = element;
  this.renderedElement = document.createElement(type);

  if (props.style) {
    //convert props' values to string to style dom element
    let value = "";
    Object.entries(props.style).forEach(el => {
      value += `${el[0]}:${el[1]};`;
    });

    this.renderedElement.setAttribute("style", value);
  }

  if (props.children) {
    const textNode = document.createTextNode(props.children);
    this.renderedElement.appendChild(textNode);
  }

  this.mount = container => {
    container.appendChild(this.renderedElement);
    return this.renderedElement;
  };

  this.update = newElement => {
    let oldChildren = this._currentElement.props.children;
    let newChildren = newElement.props.children;
    // this.updateStyle();
    this.updateText(oldChildren, newChildren);
  };

  this.updateText = (oldText, newText = "") => {
    if (oldText !== newText) {
      let child = this.renderedElement.firstChild;
      if (child) {
        child.nodeValue = newText;
      } else {
        renderedElement.textContent = newText;
      }
    }
  };
}

// const Header = React.createClass({
//   componentWillMount() {
//     console.log("I will mount now");
//   },
//   render() {
//     return React.createElement("h1", this.props);
//   }
// });

const boldSpan = React.createClass({
  setInitialState() {
    return { message: "Initial state" };
  },
  componentWillReceiveProps(nextProps) {
    this.setState({ message: "state from componentWillReceiveProps" });
  },
  render() {
    return React.createElement(
      "span",
      this.props,
      this.state.message + " " + this.props.newProp
    );
  }
});

// const Footer = React.createClass({
//   render() {
//     return React.createElement(
//       boldSpan,
//       { style: { color: "orange", "font-weight": "bold" } },
//       "I'm span in footer"
//     );
//   }
// });

// React.render(
//   React.createElement(Header, { style: { color: "red" } }, "I'm header"),
//   document.querySelector("#root")
// );

// React.render(
//   React.createElement("p", null, "I'm paragraph"),
//   document.querySelector("#root")
// );

// setTimeout(() => {
//   React.render(
//     React.createElement("p", null, "I'm paragraph changed"),
//     document.querySelector("#root")
//   );
// }, 2000);

// React.render(
//   React.createElement(boldSpan, {
//     style: { color: "orange", "font-weight": "bold" }
//   }),
//   document.querySelector("#root")
// );

// setTimeout(function() {
//   React.render(
//     React.createElement(boldSpan, {
//       style: { color: "orange", "font-weight": "bold" },
//       newProp: "text from timeout"
//     }),
//     document.getElementById("root")
//   );
// }, 2000);
// setTimeout(() => {
//   React.render(
//     React.createElement(
//       boldSpan,
//       { style: { color: "orange", "font-weight": "bold" } },
//       "I'm span after update"
//     ),
//     document.querySelector("#root")
//   );
// }, 2000);

//example text code from original
const MyComponent = React.createClass({
  componentWillMount() {
    this.renderCount = 0;
  },

  getInitialState() {
    return {
      message: "state from getInitialState"
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({ message: "state from componentWillReceiveProps" });
  },

  render() {
    this.renderCount += 1;
    return React.createElement(
      "h1",
      null,
      "this is render " +
        this.renderCount +
        ", with state: " +
        this.state.message +
        ", and this prop: " +
        this.props.prop
    );
  }
});

React.render(
  React.createElement(MyComponent, { prop: "first prop" }),
  document.getElementById("root")
);

setTimeout(function() {
  React.render(
    React.createElement(MyComponent, { prop: "second prop" }),
    document.getElementById("root")
  );
}, 2000);
