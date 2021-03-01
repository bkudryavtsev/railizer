import * as d3 from 'd3';
import { sliderBottom } from 'd3-simple-slider';

import './styles.scss';

const USD_EUR_RATE = 0.83;

(async () => {
  const data = await d3.csv('data/merged.csv', d3.autoType);
  const countryCodes = await d3.csv('data/countries_codes_and_coordinates.csv', d3.autoType);

  const countryAlpha3Name = {};

  countryCodes.forEach(country => {
    countryAlpha3Name[country['Alpha-3 code'].trim()] = country['Country'];
  });

  const meanInvestmentsMap = 
    d3.rollup(data, 
      v => d3.mean(v, d => d['INFRAINVEST'] / d['GDP'] * USD_EUR_RATE / 1000000 * 1000), 
      d => d['LOCATION']);

  const meanEmissionMap = 
    d3.rollup(data, 
      v => d3.mean(v, d => d['AIREMISSION']), 
      d => d['LOCATION']);

  const meanData = []; 

  meanInvestmentsMap.forEach((value, location) => {
    meanData.push({ 
      location: countryAlpha3Name[location], 
      infrainvest: value,
      airemission: meanEmissionMap.get(location)
    });
  });

  meanData.sort((a, b) => a.infrainvest - b.infrainvest);

  const timeSet = new Set(data.map(d => d['TIME']));

  var sliderTime = sliderBottom()
    .min(d3.min(timeSet))
    .max(d3.max(timeSet))
    .tickFormat(d3.format('d'))
    .tickValues([...timeSet])
    .step(1)
    .width(1024)
    .on('onchange', val => {console.log(val)});

  const gTime = d3
    .select('#app')
    .append('svg')
    .attr('width', 1200)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);

  const margin = {
    top: 60,
    right: 120,
    bottom: 15,
    left: 120
  };

  const width = 1024 - margin.left - margin.right,
    height = 1024 - margin.top - margin.bottom;

  const svg = d3.select('#app').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('text')
    .attr('x', (width / 2))             
    .attr('y', 0 - (margin.top / 2))
    .attr('text-anchor', 'middle')  
    .style('font-size', '16px') 
    .text('Rail Infrustructure Investments');

  const x = d3.scaleLinear()
    .range([0, width])
    .domain([0, d3.max(meanData, d => d.infrainvest)]);

  const y = d3.scaleBand()
    .rangeRound([height, 0])
    .padding(0.2)
    .domain(meanData.map(d => d.location));

  //make y axis to show bar names
  const yAxis = d3.axisLeft(y)
    //no tick marks
    .tickSize(0);

  const gy = svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis)

  const bars = svg.selectAll('.bar')
    .data(meanData)
    .enter()
    .append('g')

  //append rects
  bars.append('rect')
    .attr('class', 'bar')
    .attr('y', d => y(d.location) || 0)
    .attr('height', y.bandwidth())
    .attr('x', 0)
    .attr('width', d => x(d.infrainvest));

  //add a value label to the right of each bar
  bars.append('text')
    .attr('class', 'label')
    //y position of the label is halfway down the bar
    .attr('y', d => (y(d.location) || 0) + y.bandwidth() / 2 + 4)
    //x position is 3 pixels to the right of the bar
    .attr('x', d => x(d.infrainvest) + 3)
    .text(d => d.infrainvest.toFixed(2) + '‰ of GDP');

})();