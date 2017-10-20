/* eslint-disable no-unused-vars */
/* global d3 topojson geoNameIds */

function renderAreaChart(selector, dataset, svgHeight, svgWidth) {
  const margin = {top: 20, right: 15, bottom: 20, left: 15}
  const height = svgHeight - margin.top - margin.bottom
  const width = svgWidth - margin.left - margin.right

  const svg = d3.select(selector).append('svg')
    .attr('height', height)
    .attr('width', width)
    .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)

  const parseDate = d3.timeParse('%b %e, %Y at %I:%M %p')

  const g = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .data(dataset)

  dataset.forEach(d => {
    d.time = parseDate(d.time)
  })

  const x = d3.scaleTime()
    .range([0, width])
  const y = d3.scaleLinear()
    .range([height, 0])

  const xAxis = d3.axisBottom(x)
    .tickFormat(d3.timeFormat('%I:%M %p'))
  const yAxis = d3.axisLeft(y)
  const area = d3.area()
    .x(d => x(d.time))
    .y1(d => y(d.value))

  x.domain(d3.extent(dataset, d => d.time))
  y.domain([0, d3.max(dataset, d => d.value)])
  area.y0(y(0))

  g.append('path')
    .datum(dataset)
    .attr('fill', 'rgb(34, 120, 207)')
    .attr('stroke', 'rgb(34, 120, 207)')
    .attr('stroke-width', '2')
    .attr('fill-opacity', '0.4')
    .attr('d', area)

  g.append('g')
    .attr('transform', 'translate(0, ' + height + ')')
    .call(xAxis)

  g.append('g')
    .call(yAxis)
    .append('text')
    .attr('fill', '#000')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'end')
}

function color(country, trendData) {
  const dataIndex = trendData.findIndex(data => {
    return data.id === country.id
  })
  if (dataIndex === -1) {
    return '#bbdefb'
  }
  const region = trendData[dataIndex]
  const value = region.value
  switch (true) {
    case (value >= 0 && value < 15):
      return '#64b5f6'
    case (value >= 15 && value < 30):
      return '#42a5f5'
    case (value >= 30 && value < 45):
      return '#2196f3'
    case (value >= 45 && value < 60):
      return '#1976d2'
    case (value >= 60 && value < 75):
      return '#1565c0'
    case (value >= 75 && value < 90):
      return '#0d47a1'
    case (value >= 90 && value <= 100):
      return '#002171'
    default:
      return '#bbdefb'
  }
}

function renderGlobalHeatMap(selector, dataset, svgHeight, svgWidth, scale) {
  const map = d3.select(selector).append('svg')
    .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)

  const height = svgHeight
  const width = svgWidth

  d3.queue()
    .defer(d3.json, 'world-map.json')
    .await(ready)

  const projection = d3.geoMercator()
    .translate([width / 2, height / 2])
    .scale(scale)

  const path = d3.geoPath()
    .projection(projection)

  function ready(error, world) {
    if (error) {
      console.log(error)
    }

    const countries = topojson.feature(world, world.objects.countries).features

    dataset.forEach(set => {
      const idIndex = geoNameIds.findIndex(item => {
        return item.country === set.geoName
      })
      const geoName = geoNameIds[idIndex]
      set.id = geoName.id
    })

    map.selectAll('.countries')
      .data(countries)
      .enter().append('path')
      .attr('id', d => d.id)
      .attr('class', 'countries')
      .attr('d', path)
      .attr('stroke', '#bbdefb')
      .attr('stroke-width', '0.5')
      .attr('fill', d => color(d, dataset))
  }
}

function renderToneBarGraph(selector, dataset) {
  const chart = d3.select(selector)
    .selectAll('div')
    .data(dataset)
    .enter()
    .append('div')
    .style('width', d => d.score * 100 + '%')

  return chart
}
