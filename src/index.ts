import * as d3 from 'd3';

(async () => {
  const data = await d3.csv('data/merged.csv', d3.autoType);

  console.log(data)

})();