const getGraphDimensions = () => {
  return {
    height: window.innerHeight,
    width: (window.innerWidth * 80) / 100
  };
};

const colors = d3.scaleOrdinal(d3.schemeCategory10);

const skipZero = x => (x == 0 ? '' : x);

const lines = [];

const x = width =>
  d3
    .scaleLinear()
    .domain([-5, 5])
    .range([10, width - 10]);

const y = height =>
  d3
    .scaleLinear()
    .domain([5, -5])
    .range([10, height - 10]);

const fetchData = async equation => {
  showMessage('Fetching Data...');
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
  g.append('g').attr('class', 'x-axis');
  g.append('g').attr('class', 'y-axis');
};

const plotGraph = ({ width, height }) => {
  const svg = d3
    .select('#graph svg')
    .attr('width', width)
    .attr('height', height);

  const g = svg.select('.grapher');
  g.select('.x-axis').attr('transform', `translate(0, ${height / 2})`);
  g.select('.y-axis').attr('transform', `translate(${width / 2}, 0)`);

  const yAxis = d3
    .axisLeft(y(height))
    .ticks(11)
    .tickFormat(skipZero);

  const xAxis = d3
    .axisBottom(x(width))
    .ticks(11)
    .tickFormat(skipZero);

  svg.select('.x-axis').call(xAxis);
  svg.select('.y-axis').call(yAxis);

	const line = d3.line().context(null);
	const equations = g.selectAll('.line').data(_equations);
	equations.exit().remove();
	
	equations.enter().append('path')
    .attr('class', 'line')
    .attr('d', e => line(e.coordinates))
    .attr('stroke', (e,i)=>colors(i))
    .attr('fill', 'none');
};

const clearGraph = () => {
	_.remove(_equations,_.identity);
	updateEquations();
	plotGraph(getGraphDimensions());
};

const showMessage = message => {
  d3.select('#message').text(message);
};
const readEquation = ()=>document.querySelector('#equation').value;
const generateCoordinates = (equation, {width, height})=>{
	
	return fetchData(equation)
	.then(data => {
		showMessage('Done!');
		return data;
	})
	.then(data => data.map(({ x, y }) => [x, y]))
	.then(data => data.filter(([_x, _y]) => isFinite(_y)))
	.then(data => {
		lines.push(data.slice());
		return data;
	})
	.then(data =>
		data.map(([_x, _y]) => [
			x(width)(_x),
			y(height)(_y)
		])
	)
	.catch(error => showMessage('Something failed!' + error.toString()));
}
const updateEquations = ()=>{
	const equations = d3.select('#equations')
	.selectAll('.equation')
	.data(_equations);

	equations.exit().remove();

		equations.enter()
		.append('div')
			.attr('class','equation')
			.style('color', (e,i)=>colors(i))
			.text(e=>e.equation);
}
let _equations = [];
const onPlotClick = () => {
	const dimensions = getGraphDimensions();
	const equation = readEquation();
	generateCoordinates(equation,dimensions).then(coordinates=>{
		_equations.push({equation,coordinates});
		updateEquations();
		plotGraph(dimensions);
	});
};

const visualize = data => {
  const dimensions = getGraphDimensions();
  plotGraph(dimensions, data);
  const plotButton = document.getElementById('plot-button');
  const resetButton = document.getElementById('reset-button');
  plotButton.onclick = onPlotClick;
  resetButton.onclick = clearGraph;
};

window.onload = () => {
  initGraph();
  visualize([]);
};

window.onresize = () => {
  const dimensions = getGraphDimensions();
  const rangeLines = lines.map(line => {
    return line.map(([_x, _y]) => [x(dimensions.width)(_x), y(dimensions.height)(_y)]);
	});
	
  console.log(rangeLines);
  rangeLines.forEach(line => visualize(line));
};
