/* global createElement renderAreaChart renderGlobalHeatMap */

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

document.body.addEventListener('click', () => {
  const $targetTerm = event.target.closest('.term-card')
  if (!$targetTerm) return
  const keyword = $targetTerm.getAttribute('data-keyword')
  fetch('/trending/' + keyword)
    .then(response => response.json())
    .then(JSONResponse => {
      const datasets = []
      JSONResponse.forEach(dataset => {
        datasets.push(JSON.parse(dataset))
      })
      return datasets
    })
    .then(datasets => {
      const timelineData = datasets[0].default.timelineData
      const areaGraphData = []
      timelineData.forEach(dataset => {
        areaGraphData.push({
          'time': dataset.formattedTime,
          'value': dataset.value[0]
        })
      })
      const geoMapData = datasets[1].default.geoMapData
      const worldMapData = []
      geoMapData.forEach(dataset => {
        worldMapData.push({
          'geoName': dataset.geoName,
          'value': dataset.value[0]
        })
      })
      const data = [areaGraphData, worldMapData]
      return data
    })
    .then(data => {
      const [areaGraphData, worldMapData] = data
      renderAreaChart('#area-graph', areaGraphData, 400, 600)
      renderGlobalHeatMap('#world-map', worldMapData, 377, 600, 100)
    })
    .catch(reject => console.error(reject))
})

const $data = document.querySelector('.data')

function renderDataContainers(keyword) {
  const $div = createElement('div', {}, [
    createElement('h4', {'class': 'heading center'}, [
      'Trend Information for: "' + keyword + '"'
    ]),
    createElement('div', {'class': 'col s6'}, [
      createElement('p', {'class': 'data-header center'}, [
        'U.S. Search Interest (24 Hrs.)'
      ]),
      createElement('div', {'class': 'card z-depth-1', 'id': 'area-graph'}, []),
      createElement('p', {'class': 'data-footer center'}, [
        'Infomation via Google Trends. All times are Central Standard.'
      ])
    ]),
    createElement('div', {'class': 'col s6'}, [
      createElement('p', {'class': 'data-header center'}, [
        'Global Interest by Region (24 Hrs.)'
      ]),
      createElement('div', {'class': 'card z-depth-1', 'id': 'world-map'}, []),
      createElement('p', {'class': 'data-footer center'}, [
        'Infomation via Google Trends. All times are Central Standard.'
      ])
    ])
  ])
  return $div
}

$data.appendChild(renderDataContainers())

const $views = document.querySelectorAll('.view')

document.body.addEventListener('click', () => {
  const $targetTerm = event.target.closest('.term-card')
  if (!$targetTerm) return
  $views.forEach(view => {
    view.classList.contains('data')
      ? view.classList.remove('hide')
      : view.classList.add('hide')
  })
})
