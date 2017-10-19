/* global createElement renderAreaChart renderGlobalHeatMap HashRouter */

const $views = document.querySelectorAll('.view')
const $home = document.querySelector('#home')
const $searchForm = document.querySelector('#searchbar')
const today = new Date(Date.now())

fetch('/trending')
  .then(response => response.json())
  .then(data => {
    $home.appendChild(renderHomeTrends(data, 1))
  })
  .catch(reject => console.error(reject))

function renderHomeTrends(termList, startNumber) {
  let number = startNumber
  const $element = createElement('div', {'class': 'row'}, [])
  const $heading = createElement('h4', {'class': 'heading center'}, [
    'Trending Searches - ' + (today.getMonth() + 1) + '/' + today.getDate() +
      '/' + today.getFullYear()
  ])
  $element.appendChild($heading)
  termList.forEach(term => {
    const $child = createElement('div', {'class': 'col s8 offset-s2'}, [
      createElement('div', {
        'class': 'term-card card white',
        'data-keyword': term
      }, [
        createElement('h5', {
          'class': 'term-content card-content'
        }, [number + '. ' + term])
      ])
    ])
    number++
    $element.appendChild($child)
  })
  return $element
}

document.body.addEventListener('click', () => {
  const $targetTerm = event.target.closest('.term-card')
  if (!$targetTerm) return
  router.push('data', {'keyword': $targetTerm.getAttribute('data-keyword')})
})

function fetchKeywordData(keyword) {
  return fetch('/trending/' + keyword)
    .then(response => response.json())
    .then(data => {
      const [areaGraphData, worldMapData] = data
      renderAreaChart('#area-graph', areaGraphData, 400, 600)
      renderGlobalHeatMap('#world-map', worldMapData, 377, 600, 100)
    })
    .catch(reject => console.error(reject))
}

function renderDataContainers() {
  const $div = createElement('div', {'class': 'row'}, [
    createElement('h4', {'class': 'heading center'}, [
      'Trend Information for: ',
      createElement('span', {'id': 'keyword'}, ['test'])
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
    ]),
    createElement('div', {'class': 'col s6'}, [
      createElement('p', {'class': 'data-header center'}, [
        'Twitter - Most Popular'
      ]),
      createElement('div', {'class': 'card z-depth-1', 'id': 'tweets'}, []),
      createElement('p', {'class': 'data-footer center'}, [
        'Infomation via Twitter.'
      ])
    ])
  ])
  return $div
}

$searchForm.addEventListener('submit', () => {
  event.preventDefault()
  const formData = new FormData($searchForm)
  const keyword = formData.get('keyword')
  router.push('data', {'keyword': keyword})
  $searchForm.reset()
})

const router = new HashRouter($views)

router.when('home', ($view, params) => {
  return fetch('/trending')
    .then(response => response.json())
    .then(data => {
      $view.innerHTML = ''
      $view.appendChild(renderHomeTrends(data, 1))
    })
    .catch(reject => console.error(reject))
})

router.when('data', ($view, params) => {
  $view.innerHTML = ''
  $view.appendChild(renderDataContainers())
  const $keyword = document.querySelector('#keyword')
  $keyword.textContent = '"' + params.keyword + '"'
  return Promise.all([
    fetchKeywordData(params.keyword),
    fetchTweets(params.keyword)
  ])
})

router.listen()

function fetchTweets(keyword) {
  return fetch('/tweets/' + keyword)
    .then(response => response.json())
    .then(parsed => {
      const $tweets = document.querySelector('#tweets')
      $tweets.appendChild(renderTweets(parsed))
    })
    .catch(reject => console.error)
}

function renderTweets(filteredData) {
  const $list = document.createElement('ul')
  filteredData.forEach(dataset => {
    const date = tweetDate(dataset.createDate)
    const $tweet = createElement('li', {'class': 'tweet'}, [
      createElement('a', {'href': dataset.tweetURL}, [
        createElement('div', {'class': 'tweet-header'}, [
          createElement('div', {'class': 'tweet-header-left'}, [
            createElement('img', {
              'class': 'user-img',
              'src': dataset.userProfileImg
            }, [])
          ]),
          createElement('div', {'class': 'tweet-header-center'}, [
            createElement('h5', {'class': 'user-name'}, [
              createElement('a', {
                'href': 'https://twitter.com/' + dataset.screenName
              }, [dataset.username])
            ]),
            createElement('span', {
              'class': 'user-screen-name'
            }, ['@' + dataset.screenName])
          ]),
          createElement('div', {'class': 'tweet-header-right right'}, [
            createElement('a', {'href': 'https://twitter.com'}, [
              createElement('img', {'src': 'images/Twitter_Logo_Blue.png'}, [])
            ])
          ])
        ]),
        createElement('div', {'class': 'tweet-body'}, [
          createElement('p', {'class': 'tweet-text'}, [dataset.text])
        ]),
        createElement('div', {'class': 'tweet-footer'}, [
          createElement('div', {'class': 'replies valign-wrapper'}, [
            createElement('span', {'class': 'icons replies-icon'}, ['']),
            createElement('span', {'class': 'replies-count'}, ['N/A'])
          ]),
          createElement('div', {'class': 'retweets valign-wrapper'}, [
            createElement('span', {'class': 'icons retweets-icon'}, ['']),
            createElement('span', {
              'class': 'retweets-count'
            }, [dataset.retweetCount])
          ]),
          createElement('div', {'class': 'favorites valign-wrapper'}, [
            createElement('span', {'class': 'icons favorties-icon'}, ['']),
            createElement('span', {
              'class': 'favorites-count'
            }, [dataset.favoriteCount])
          ]),
          createElement('div', {'class': 'timestamp right'}, [
            createElement('span', {'class': 'time'}, [date])
          ])
        ])
      ])
    ])
    $list.appendChild($tweet)
  })
  return $list
}

function tweetDate(dateString) {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  const tweetDate = day + ' ' + months[month] + ' ' + year
  return tweetDate
}
