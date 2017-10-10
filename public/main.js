/* global createElement */

const $home = document.querySelector('.home')

fetch('/trending')
  .then(response => response.json())
  .then(data => {
    data.forEach(term => {
      $home.appendChild(renderTrendTerm(term))
    })
  })
  .catch(reject => console.error(reject))

function renderTrendTerm(term) {
  const $element = createElement('div', {
    'class': 'term-card col s12 m6 l3 xl3',
    'data-keyword': term
  }, [
    createElement('h3', {}, [term])
  ])
  return $element
}
