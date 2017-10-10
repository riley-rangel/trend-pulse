/* global createElement */

fetch('/trending')
  .then(response => response.json())
  .then(data => {
    data.forEach(term => {
      console.log(renderTrendTerm(term))
    })
  })
  .catch(reject => console.error(reject))

function renderTrendTerm(term) {
  const $element = createElement('div', {'class': 'term-card', 'data-keyword': term}, [
    createElement('h3', {}, [term])
  ])
  return $element
}
