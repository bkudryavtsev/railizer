import * as d3 from 'd3';

export class MainChart {
  constructor(width, height) {
    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };
    this.width = width - this.margin.left - this.margin.right;
    this.height = height - this.margin.top - this.margin.bottom;
    this.locationWidth = 120;
    this.defaultBarWidth = 2000;

    this.x = d3.scaleLinear()
      .domain([0, this.defaultBarWidth])
      .range([0, this.width / 2]);

    this.y = d3.scaleBand()
      .rangeRound([0, this.height])
      .padding(0.1)

    d3.select('#main-chart').selectAll('svg').remove()

    this.svg = d3.select('#main-chart').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
  }

  update(data) {
    this.x.domain([0, d3.max(data, d => d['INFRAINVEST'])]);
    this.y.domain(data.map(d => d['LOCATION']));

    const row = this.svg.selectAll('g.row')
      .data(data, d => d['LOCATION']);
      
    const newRow = row.enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', `translate(0, ${this.height + this.margin.top + this.margin.bottom})`);

    newRow.insert('rect')
      .attr('class','bar')
      .attr('x', this.locationWidth)
      .attr('opacity', 0)
      .attr('height', this.y.bandwidth())
      .attr('width', d => this.x(d['INFRAINVEST']));

    newRow.append('text')
      .attr('class','label')
      .attr('y', this.y.bandwidth() / 2)
      .attr('x', d => this.x(d['INFRAINVEST']) + this.locationWidth)
      .attr('opacity', 0)
      .attr('dy','0.35em')
      .attr('dx','0.5em')
      .text(d => d['INFRAINVEST']); 
    
    newRow.append('text')
      .attr('class','location')
      .attr('text-overflow','ellipsis')
      .attr('y', this.y.bandwidth() / 2)
      .attr('x', 0)
      .attr('opacity', 0)
      .attr('dy','0.35em')
      .attr('dx','0.5em')
      .text(d => d['LOCATION']);

    row.select('.bar')
      .transition()
      .duration(300)
      .attr('height', this.y.bandwidth())
      .attr('width', d => this.x(d['INFRAINVEST']))
      .attr('opacity', 1);

    row.select('.label')
      .transition()
      .duration(300)
      .attr('opacity', 1)
      .attr('x', d => this.x(d['INFRAINVEST']) + this.locationWidth)
      .text(d => d['INFRAINVEST']);

    row.select('.location')
      .transition()
      .duration(300)
      .attr('opacity', 1);

    row.exit()
      .transition()
      .style('opacity', 0)
      .attr('transform', `translate(0, ${this.height + this.margin.top + this.margin.bottom})`)
      .remove();

    row.transition()
      .delay((d, i) => 200 + i * 30)
      .duration(900)
      .attr('transform', d => `translate(0, ${this.y(d['LOCATION'])})`);
  };
}