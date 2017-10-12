/* global createElement */

const $home = document.querySelector('.home')
const today = new Date(Date.now())

fetch('/trending')
  .then(response => response.json())
  .then(data => {
    const $heading = createElement('h4', {'class': 'heading center'}, [
      'Trending Searches - ' + (today.getMonth() + 1) + '/' + today.getDate() +
        '/' + today.getFullYear()
    ])
    $home.appendChild($heading)
    let number = 1
    data.forEach(term => {
      $home.appendChild(renderTrendTerm(term, number))
      number++
    })
  })
  .catch(reject => console.error(reject))

function renderTrendTerm(term, number) {
  const $element = createElement('div', {'class': 'col s8 offset-s2'}, [
    createElement('div', {
      'class': 'term-card card white',
      'data-keyword': term
    }, [
      createElement('h5', {
        'class': 'term-content card-content'
      }, [number + '. ' + term])
    ])
  ])
  return $element
}
