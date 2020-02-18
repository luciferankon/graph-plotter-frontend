const width = 800;
const height = 600;

const skipZero = x => (x == 0 ? "" : x);
const x = d3
	.scaleLinear()
	.domain([-5, 5])
	.range([10, width - 10]);

const y = d3
	.scaleLinear()
	.domain([5, -5])
	.range([10, height - 10]);

const fetchData = async equation => {
  showMessage("Fetching Data...");
	const response = await fetch("https://math-exp.herokuapp.com", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ eq: equation, range: "(range -6 6 0.1)" })
	});
	return response.json();
};

const plotGraph = data => {
	const svg = d3
		.select("#graph svg")
		.attr("width", width)
		.attr("height", height);

	const g = svg.append("g").attr("class", "grapher");

	g.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0, ${height / 2})`);
	g.append("g")
		.attr("class", "y-axis")
		.attr("transform", `translate(${width / 2}, 0)`);

	const yAxis = d3
		.axisLeft(y)
		.ticks(11)
		.tickFormat(skipZero);

	const xAxis = d3
		.axisBottom(x)
		.ticks(11)
		.tickFormat(skipZero);

	svg.select(".x-axis").call(xAxis);
	svg.select(".y-axis").call(yAxis);

	const line = d3.line().context(null);
	svg
		.append("path")
		.attr("class", "line")
		.attr("d", line(data))
		.attr("stroke", "crimson")
		.attr("fill", "none");
};

const clearGraph = () => {
	d3.selectAll(".line").remove();
};

const showMessage = message => {
	d3.select("#message").text(message);
};

const visualize = () => {
	plotGraph([]);
	const plotButton = document.getElementById("plot-button");
	const resetButton = document.getElementById("reset-button");
	const equation = document.getElementById("equation");
	plotButton.onclick = () => {
		fetchData(equation.value)
			.then(data => {
				showMessage("Done!");
				return data;
			})
			.then(data => data.map(({ x, y }) => [x, y]))
			.then(data => data.filter(([_x, _y]) => isFinite(_y)))
			.then(data => data.map(([_x, _y]) => [x(_x), y(_y)]))
			.then(plotGraph)
			.catch(() => showMessage("Something failed!"));
	};
	resetButton.onclick = clearGraph;
};

window.onload = visualize;
