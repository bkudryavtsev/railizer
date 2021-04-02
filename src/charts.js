import * as d3 from 'd3';

export class MainChart {
  constructor(width, height) {
    this.margin = { top: 0, right: 100, bottom: 0, left: 100 };
    this.centerTextWidth = 100;
    this.defaultBarWidth = 100;
    this.width = width;
    this.height = height;
    this.center = this.width / 2;

    this.x1 = d3.scaleLinear()
      .domain([0, this.defaultBarWidth])
      .range([0, this.center - this.centerTextWidth / 2 - this.margin.left]);

    this.x2 = d3.scaleLinear()
      .domain([0, this.defaultBarWidth])
      .range([0, this.center - this.centerTextWidth / 2 - this.margin.right]);

    this.y = d3.scaleBand()
      .rangeRound([0, this.height])
      .padding(0.1);

    d3.select('#main-chart').selectAll('svg').remove();

    this.svg = d3.select('#main-chart').append('svg')
      .attr("viewBox", [0, 0, this.width, this.height])
      .append('g');
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
      .attr('class','label')
      .attr('y', this.y.bandwidth() / 2)
      .attr('x', d => this.x2(d['INFRAINVEST']) + this.centerTextWidth / 2)
      .attr('opacity', 0)
      .attr('dy','0.35em')
      .attr('dx','0.5em')
      .text(d => d['INFRAINVEST']); 
    
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

    row.select('.label')
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .attr('x', d => this.center + this.x2(d['INFRAINVEST']) + this.centerTextWidth / 2)
      .text(d => `${d['INFRAINVEST']}‰ of GDP`);

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