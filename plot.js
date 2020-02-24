const getGraphDimensions = () => {
  return {
    height: window.innerHeight,
    width: (window.innerWidth * 80) / 100
  };
};

const colors = d3.scaleOrdinal(d3.schemeCategory10);

const skipZero = x => (x == 0 ? '' : x);

const fetchData = async equation => {
  showMessage('Fetching Data...', MESSAGE_TYPE_INFO, MESSAGE_LIFE_LONG);
  const response = await fetch('https://math-exp.herokuapp.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ eq: equation, range: '(range -6 6 0.1)' })
  });
  return response.json();
};

const initGraph = () => {
  const svg = d3.select('#graph svg');
  const g = svg.append('g').attr('class', 'grapher');
  g.append('g').attr('class', 'y-axis');
  g.append('g').attr('class', 'x-axis');
  g.append('line').attr('class', 'y-axis-line');
};

const bringYAxisToFront = height => {
  const yAxis = d3.select('#graph svg .grapher .y-axis');
  const domainLine = yAxis.select('.domain');
  const transformation = yAxis.attr('transform');
  domainLine.remove();
  d3.select('.grapher .y-axis-line')
    .attr('y1', 0)
    .attr('y2', height)
    .attr('transform', transformation);
};

const plotGraph = () => {
  const { width, height } = getGraphDimensions();
  const x = d3
    .scaleLinear()
    .domain([-5, 5])
    .range([10, width - 10]);

  const y = d3
    .scaleLinear()
    .domain([5, -5])
    .range([10, height - 10]);

  const svg = d3
    .select('#graph svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.select('.grapher');
  g.select('.x-axis').attr('transform', `translate(0, ${height / 2})`);
  g.select('.y-axis').attr('transform', `translate(${width / 2}, 0)`);

  const yAxis = d3
    .axisLeft(y)
    .ticks(20)
    .tickFormat(skipZero);

  g.select('.y-axis').call(yAxis);
  g.selectAll('.y-axis .tick line')
    .attr('x1', -x.range()[1])
    .attr('x2', x.range()[1]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(20)
    .tickFormat(skipZero);

  g.select('.x-axis').call(xAxis);
  g.selectAll('.x-axis .tick line')
    .attr('y1', -y.range()[1])
    .attr('y2', y.range()[1]);

  const equationPath = e =>
    d3.line()(e.coordinates.map(([_x, _y]) => [x(_x), y(_y)]));

  const equations = g.selectAll('.line').data(_equations);
  equations.exit().remove();

  equations
    .enter()
    .append('path')
    .attr('class', 'line')
    .attr('stroke', (e, i) => colors(i))
    .attr('fill', 'none')
    .attr('stroke-width', '2px')
    .merge(equations)
    .attr('d', equationPath);

  bringYAxisToFront(height);
};

const clearGraph = () => {
  _.remove(_equations, _.identity);
  updateEquations();
  plotGraph();
};

const readEquation = () => document.querySelector('#equation').value;

const generateCoordinates = equation => {
  return fetchData(equation)
    .then(data => {
      showMessage('Done!', MESSAGE_TYPE_SUCCESS, MESSAGE_LIFE_SHORT);
      return data;
    })
    .then(data => data.map(({ x, y }) => [x, y]))
    .then(data => data.filter(([_x, _y]) => isFinite(_y)));
};

const updateEquations = () => {
  const equations = d3
    .select('#equations')
    .selectAll('.equation')
    .data(_equations);

  equations.exit().remove();

  equations
    .enter()
    .append('div')
    .attr('class', 'equation')
    .style('color', (e, i) => colors(i))
    .text(e => e.equation);
};
let _equations = [];
const onPlotClick = () => {
  const equation = readEquation();
  generateCoordinates(equation)
    .then(coordinates => {
      _equations.push({ equation, coordinates });
      updateEquations();
      plotGraph();
    })
    .catch(error =>
      showMessage(
        'Something failed!' + error.toString(),
        MESSAGE_TYPE_ERROR,
        MESSAGE_LIFE_SHORT
      )
    );
};

const visualize = () => {
  plotGraph();
  const plotButton = document.getElementById('plot-button');
  const resetButton = document.getElementById('reset-button');
  plotButton.onclick = onPlotClick;
  resetButton.onclick = clearGraph;
};

window.onload = () => {
  initGraph();
  visualize();
};

window.onresize = plotGraph;
