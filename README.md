### fake react

Reat object has three method:

1. `createElement` creates object with type property that can be function or string (html tag), merges second and thired arruments in props property
2. `createClass` is a HOC that wraps render method and return class;
3. `render`

##### consructor functions:

1. `compositeComponent` that call class component's render method until element with `type` property of type string is retarned, passes element to `domComponent` and then inserts generated html into dom
2. `domComponent` creates dom element from object
