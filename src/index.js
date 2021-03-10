import * as d3 from 'd3';
import throttle from 'lodash/throttle';
import { sliderBottom } from 'd3-simple-slider'
import { MainChart } from './charts';

import './styles.scss';
import { sortBy } from 'lodash';

const USD_EUR_RATE = 0.83;
const PRECISION = 2;

(async () => {
  const data = await d3.csv('data/merged.csv', d3.autoType);
  const countryCodes = await d3.csv('data/countries_codes_and_coordinates.csv', d3.autoType);

  const timeSet = new Set(data.map(d => d['TIME']));

  const countryAlpha3Name = {};

  countryCodes.forEach(country => {
    countryAlpha3Name[country['Alpha-3 code'].trim()] = country['Country'];
  });

  const formatData = (year, sortBy) => {
    const _data = data.filter(d => d['TIME'] === year);
    return _data.map(y => ({
      'LOCATION': countryAlpha3Name[y['LOCATION']],
      'INFRAINVEST': +(y['INFRAINVEST'] / y['GDP'] * USD_EUR_RATE / 1000000 * 1000).toFixed(PRECISION),
      'AIREMISSION': +(y['AIREMISSION']).toFixed(PRECISION) 
    })).sort((a, b) => b[sortBy] - a[sortBy]);
  };

  const mainChart = new MainChart(1024, 1024);
  mainChart.update(formatData(2018, 'INFRAINVEST'));

  const sliderTime = sliderBottom()
    .min(d3.min(timeSet))
    .max(d3.max(timeSet))
    .default(2018)
    .tickFormat(d3.format('d'))
    .tickValues([...timeSet])
    .step(1)
    .width(700)
    .on('onchange', throttle(val => {
      mainChart.update(formatData(val, 'INFRAINVEST'));
    }, 100));

  const gTime = d3
    .select('#time-slider')
    .append('svg')
    .attr('width', 800)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gTime.call(sliderTime);
})();