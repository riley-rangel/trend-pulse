/* eslint-disable no-unused-vars */
/* global d3 topojson */

function renderAreaChart(selector, dataset) {
  const margin = {top: 20, right: 20, bottom: 20, left: 50}
  const height = 400 - margin.top - margin.bottom
  const width = 1000 - margin.left - margin.right

  const svg = d3.select(selector).append('svg')
    .attr('height', height)
    .attr('width', width)

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
