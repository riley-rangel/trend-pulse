/* eslint-disable no-unused-vars */

const createElement = function (tag, attributes, children) {
  const $element = document.createElement(tag)
  for (const key in attributes) {
    $element.setAttribute(key, attributes[key])
  }
  children.forEach(child => {
    child instanceof Node
      ? $element.appendChild(child)
      : $element.appendChild(document.createTextNode(child))
  })
  return $element
}
