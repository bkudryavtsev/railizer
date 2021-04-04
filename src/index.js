import * as d3 from 'd3';
import { nest } from 'd3-collection';
import throttle from 'lodash/throttle';
import { sliderBottom } from 'd3-simple-slider'
import { MainChart, SecondaryChart } from './charts';

import './styles.scss';

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

  const formatData = (yearRange, sortBy, mean = true) => {
    const _data = data.filter(d => d['TIME'] >= yearRange[0] && d['TIME'] <= yearRange[1]);

    if (!mean) {
      return _data.map(entry => ({
        'LOCATION': countryAlpha3Name[entry['LOCATION']],
        'INFRAINVEST': +(entry['INFRAINVEST'] / entry['GDP'] * USD_EUR_RATE / 1000000 * 1000).toFixed(PRECISION),
        'AIREMISSION': +(entry['AIREMISSION']).toFixed(PRECISION),
        'PASSTRANSP': +(entry['PASSTRANSP']).toFixed(PRECISION),
        'ROADACCID': +(entry['ROADACCID']).toFixed(PRECISION),
        'TIME': +entry['TIME'],
        'GDP': +(entry['GDP']).toFixed(PRECISION)
      })).sort((a, b) => b[sortBy] - a[sortBy]);
    }

    const nestedData = nest()
      .key(d => d['LOCATION'])
      .rollup(v => ({ 
        'INFRAINVEST': d3.mean(v, d => d['INFRAINVEST']),
        'AIREMISSION': d3.mean(v, d => d['AIREMISSION']),
        'PASSTRANSP': d3.mean(v, d => d['PASSTRANSP']),
        'ROADACCID': d3.mean(v, d => d['ROADACCID']),
        'GDP': d3.mean(v, d => d['GDP'])
      }))
      .entries(_data);

    return nestedData.map(({ key, value }) => ({
      'LOCATION': countryAlpha3Name[key],
      'INFRAINVEST': +(value['INFRAINVEST'] / value['GDP'] * USD_EUR_RATE / 1000000 * 1000).toFixed(PRECISION),
      'AIREMISSION': +(value['AIREMISSION']).toFixed(PRECISION),
      'PASSTRANSP': +(value['PASSTRANSP']).toFixed(PRECISION),
      'ROADACCID': +(value['ROADACCID']).toFixed(PRECISION)
    })).sort((a, b) => b[sortBy] - a[sortBy]);
  };

  const defaultDateRange = [2010, 2016];

  const mainChart = new MainChart(512, 700);
  mainChart.update(formatData(defaultDateRange, 'INFRAINVEST'));
  mainChart.update(formatData(defaultDateRange, 'INFRAINVEST'));

  const secondaryChart = new SecondaryChart(512, 300);

  const topFive = formatData(defaultDateRange, 'INFRAINVEST').slice(0, 5).map(d => d['LOCATION']);
  secondaryChart.update(formatData(defaultDateRange, 'INFRAINVEST', false).filter(d => topFive.includes(d['LOCATION'])));

  const sliderTime = sliderBottom()
    .min(d3.min(timeSet))
    .max(d3.max(timeSet))
    .default(defaultDateRange)
    .tickFormat(d3.format('d'))
    .tickValues([...timeSet])
    .step(1)
    .width(700)
    .fill('#777777')
    .on('onchange', throttle(val => {
      mainChart.update(formatData(val, 'INFRAINVEST'));
      mainChart.update(formatData(val, 'INFRAINVEST'));

      const topFive = formatData(val, 'INFRAINVEST').slice(0, 5).map(d => d['LOCATION']);
      secondaryChart.update(formatData(val, 'INFRAINVEST', false).filter(d => topFive.includes(d['LOCATION'])));
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