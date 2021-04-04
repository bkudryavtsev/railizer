import * as d3 from 'd3';

export class MainChart {
  constructor(width, height) {
    this.margin = { top: 0, right: 30, bottom: 0, left: 20 };
    this.centerTextWidth = 100;
    this.defaultBarWidth = 100;
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;
    this.center = this.width / 2;

    this.x1 = d3.scaleLinear()
      .domain([0, this.defaultBarWidth])
      .range([0, this.center - this.centerTextWidth / 2 - this.margin.left - 8]);

    this.x2 = d3.scaleLinear()
      .domain([0, this.defaultBarWidth])
      .range([0, this.center - this.centerTextWidth / 2 - this.margin.right]);

    this.y = d3.scaleBand()
      .rangeRound([this.margin.top, this.height - this.margin.bottom])
      .padding(0.1);

    d3.select('#main-chart').selectAll('svg').remove();

    this.legend = d3.select('#main-chart-legend').append('svg')
      .attr('viewBox', [0, 0, width, 50])
      .append('g');
      
    this.legend.append('text')
      .attr('class', 'legend-h1')
      .attr('x', this.margin.left + this.center - 5)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .text('Country')

    this.legend.append('text')
      .attr('class', 'legend-h1')
      .attr('x', this.margin.left + this.center / 2 - 15)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('Fatal Road Accidents')

    this.legend.append('text')
      .attr('class', 'legend-h2')
      .attr('x', this.margin.left + this.center / 2 - 15)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .text('(per 1 million habitants)');

    this.legend.append('text')
      .attr('class', 'legend-h1')
      .attr('x', width - this.center / 2)
      .attr('y', 15)
      .attr('text-anchor', 'middle')
      .text('Rail Infrustructure Investments');

    this.legend.append('text')
      .attr('class', 'legend-h2')
      .attr('x', width - this.center / 2)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .text('(‰ of GDP)');

    this.svg = d3.select('#main-chart').append('svg')
      .attr('viewBox', [0, 0, width, height])
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  update(data) {
    this.x1.domain([0, d3.max(data, d => d['ROADACCID'])]);
    this.x2.domain([0, d3.max(data, d => d['INFRAINVEST'])]);
    this.y.domain(data.map(d => d['LOCATION']));

    const row = this.svg.selectAll('g.row')
      .data(data, d => d['LOCATION']);
      
    const newRow = row.enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', `translate(0, ${this.height})`);

    newRow.insert('rect')
      .attr('class','bar-roadaccid')
      .attr('x', d => this.center - this.centerTextWidth / 2 - this.x1(d['ROADACCID']))
      .attr('opacity', 0)
      .attr('height', this.y.bandwidth())
      .attr('width', d => this.x1(d['ROADACCID']));

    newRow.insert('rect')
      .attr('class','bar-infrainvest')
      .attr('x', this.center + this.centerTextWidth / 2)
      .attr('opacity', 0)
      .attr('height', this.y.bandwidth())
      .attr('width', d => this.x2(d['INFRAINVEST']));

    newRow.append('text')
      .attr('class','label-infrainvest')
      .attr('y', this.y.bandwidth() / 2)
      .attr('x', d => this.x2(d['INFRAINVEST']) + this.centerTextWidth / 2)
      .attr('opacity', 0)
      .attr('dy','0.35em')
      .attr('dx','0.5em')
      .text(d => d['INFRAINVEST']); 

    newRow.append('text')
      .attr('class','label-roadaccid')
      .attr('y', this.y.bandwidth() / 2)
      .attr('x', d => this.center - this.centerTextWidth / 2 - this.x1(d['ROADACCID']))
      .attr('opacity', 0)
      .attr('dy','0.35em')
      .attr('dx','0.5em')
      .attr('text-anchor', 'end')
      .text(d => d['ROADACCID']); 
    
    newRow.append('text')
      .attr('class','location')
      .attr('text-anchor','middle')
      .attr('y', this.y.bandwidth() / 2)
      .attr('x', this.center)
      .attr('opacity', 0)
      .attr('dy','0.35em')
      .text(d => d['LOCATION']);

    row.select('.bar-roadaccid')
      .attr('x', d => this.center - this.centerTextWidth / 2 - this.x1(d['ROADACCID']))
      .attr('opacity', 1)
      .attr('height', this.y.bandwidth())
      .attr('width', d => this.x1(d['ROADACCID']))

    row.select('.bar-infrainvest')
      .transition()
      .duration(300)
      .attr('height', this.y.bandwidth())
      .attr('width', d => this.x2(d['INFRAINVEST']))
      .attr('opacity', 1);

    row.select('.label-infrainvest')
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .attr('x', d => this.center + this.x2(d['INFRAINVEST']) + this.centerTextWidth / 2)
      .text(d => `${d['INFRAINVEST']}‰`);

    row.select('.label-roadaccid')
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .attr('x', d => this.center - this.x1(d['ROADACCID']) - this.centerTextWidth / 2 - 8)
      .text(d => d['ROADACCID']);

    row.select('.location')
      .transition()
      .duration(300)
      .attr('opacity', 1);

    row.exit()
      .transition()
      .style('opacity', 0)
      .attr('transform', `translate(0, ${this.height})`)
      .remove();

    row.transition()
      .delay((d, i) => 200 + i * 30)
      .duration(900)
      .attr('transform', d => `translate(0, ${this.y(d['LOCATION'])})`);

    row.select('.bar1')
      .attr('y', d => this.y(d['LOCATION']) + this.y.bandwidth() / 2);
  };
}

export class SecondaryChart {
  constructor(width, height) {
    this.margin = { top: 50, right: 50, bottom: 60, left: 100 };
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;
    this.maxRadius = 10;
    this.colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    d3.select('#secondary-chart').selectAll('svg').remove(); 

    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([0, this.height]);
    this.r = d3.scaleLinear().range([0, this.maxRadius]);
    this.color = d3.scaleOrdinal().range(this.colors);

    this.svg = d3.select('#secondary-chart').append('svg')
      .attr('viewBox', [0, 0, width, height])
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`); 

    this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${this.height + 20})`);

    this.svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(-20, 0)`);

    this.svg.append('text')
      .attr('class', 'legend-h1')
      .attr('transform', 'rotate(-90)')
      .attr('y', -70)
      .attr('x', 0 - this.height / 2)
      .style('text-anchor', 'middle')
      .text('Air emission');

    this.svg.append('text')
      .attr('class', 'legend-h2')
      .attr('transform', 'rotate(-90)')
      .attr('y', -58)
      .attr('x', 0 - this.height / 2)
      .style('text-anchor', 'middle')
      .text('(million tonnes CO2)');

    this.svg.append('text')
      .attr('class', 'legend-h1')
      .attr('y', this.height + 60)
      .attr('x', this.width / 2)
      .style('text-anchor', 'middle')
      .text('Year');
  }

  update(data) {
    this.x.domain([d3.min(data, d => d['TIME']), d3.max(data, d => d['TIME'])]);
    this.y.domain([d3.max(data, d => d['AIREMISSION']), d3.min(data, d => d['AIREMISSION'])]);
    this.r.domain([d3.min(data, d => d['INFRAINVEST']), d3.max(data, d => d['INFRAINVEST'])]);
    this.color.domain([...new Set(data.map(d => d['LOCATION']))]);

    const xAxis = d3.axisBottom(this.x)
      .tickFormat(d3.format('d'))
      .ticks(d3.max(data, d => d['TIME']) - d3.min(data, d => d['TIME']))
      .tickSize(-5);
    const yAxis = d3.axisLeft(this.y)
      .tickSize(-5);

    this.svg.select('.x-axis').call(xAxis);
    this.svg.select('.y-axis').call(yAxis);

    const bubbles = this.svg.selectAll('g.bubble')
      .data(data, d => d['LOCATION']);

    const bubble = bubbles.enter()
      .append('g')
      .attr('class', 'bubble');

    bubble.insert('circle')
      .attr('cx', d => this.x(d['TIME']))
      .attr('cy', d => this.y(d['AIREMISSION']))
      .attr('r', d => this.r(d['INFRAINVEST']))
      .style('fill', d => this.color(d['LOCATION']));

    bubbles.select('circle')
      .attr('cx', d => this.x(d['TIME']))
      .attr('cy', d => this.y(d['AIREMISSION']))
      .attr('r', d => this.r(d['INFRAINVEST']))
      .style('fill', d => this.color(d['LOCATION']));

    bubbles.exit().remove();
  }
}