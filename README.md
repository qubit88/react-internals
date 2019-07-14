### fake react

Reat object has three method:

1. `createElement` creates object with type property that can be function or a string (html tag), merges second and third arruments in props property
2. `createClass` is a HOC that wraps render method of argument object and returns class;
3. `render`

##### consructor functions:

1. `compositeComponent` that calls class component's render method until element with `type` property of type string is returned, passes element to `domComponent` and then inserts generated html into dom
2. `domComponent` creates dom element from object
