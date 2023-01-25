class Scatterplot {

  /**
    * Class constructor with basic chart configuration
    * @param {Object}
    * @param {Array}
    */
  constructor(_config, _data) {
    // Configuration object with defaults
    // Important: depending on your vis and the type of interactivity you need
    // you might want to use getter and setter methods for individual attributes
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 35, right: 50, bottom: 25, left: 50 }
    }
    this.data = _data;
    this.initVis();
  }

  /**
   * This function contains all the code that gets excecuted only once at the beginning.
   * (can be also part of the class constructor)
   * We initialize scales/axes and append static elements, such as axis titles.
   * If we want to implement a responsive visualization, we would move the size
   * specifications to the updateVis() function.
   */
  initVis() {
    // We recommend avoiding simply using the this keyword within complex class code
    // involving SVG elements because the scope of this will change and it will cause
    // undesirable side-effects. Instead, we recommend creating another variable at
    // the start of each function to store the this-accessor
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    // You need to adjust the margin config depending on the types of axis tick labels
    // and the position of axis titles (margin convetion: https://bl.ocks.org/mbostock/3019563)
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Calculate means of the efficacy
    vis.efficacyMean = d3.rollups(vis.data, v => d3.mean(v, d => d.efficacy), d => d.trial)
    console.log(vis.efficacyMean)
    // Initialize scales

    vis.xScale = d3.scaleLinear()
      // .domain([0,1])
      .range([0, vis.width]);

    vis.yScale = d3.scaleBand()
      .domain(d3.group(vis.data, d => d.trial).keys())
      .range([0, vis.height]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
      .ticks(6)
      .tickSize(-vis.height - 10)
      .tickPadding(10)
      .tickFormat(d => d);

    vis.yAxisL = d3.axisLeft(vis.yScale)
      .ticks(4)
      .tickSize(-vis.width - 10)
      .tickFormat(d => "Trial " + d)
      .tickPadding(10);

    // Rounds to 2 decimals
    let roundFormatter = d3.format(".2")

    vis.yAxisR = d3.axisRight(vis.yScale)
      .ticks(4)
      .tickSize(-vis.width - 10)
      .tickFormat((d, i) => roundFormatter(vis.efficacyMean[i][1]))
      .tickPadding(10);
    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
      .attr('class', 'axis y-axis' , 'axis_yLine')

    vis.yAxisGR = vis.chart.append('g')
      .attr('class', 'axis y-axis-r')
      .attr('transform', `translate(${vis.width},0)`)

    // Append both axis titles
    vis.chart.append('text')
        // .attr('class', 'axis-title')
        .attr('y', -15)
        .attr('x', vis.width + 10)
        .attr("text-anchor", "end")
        .text('Drug Efficacy (mean)');
  }

  /**
   * This function contains all the code to prepare the data before we render it.
   * In some cases, you may not need this function but when you create more complex visualizations
   * you will probably want to organize your code in multiple functions.
   */
  updateVis() {
    let vis = this;

    // Specificy accessor functions
    // vis.colorValue = d => d.difficulty;
    vis.xValue = d => d.efficacy;
    vis.yValue = d => d.trial;

    // Set the scale input domains
    vis.xScale.domain([0, d3.max(vis.data, vis.xValue)]);
    // vis.yScale1.domain([d3.min(vis.data, vis.yValue), d3.max(vis.data, vis.yValue)]);
    // vis.yScale2.domain([d3.min(vis.data, vis.yValue), d3.max(vis.data, vis.yValue)]);

    vis.renderVis();
  }

  /**
   * This function contains the D3 code for binding data to visual elements.
   * We call this function every time the data or configurations change.
   */
  renderVis() {
    let vis = this;

    // Add circles
    vis.chart.selectAll('.point')
      .data(vis.data)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('r', 8)
      .attr('cy', d => vis.yScale(vis.yValue(d)) + (vis.yScale.bandwidth()/2))
      .attr('cx', d => vis.xScale(vis.xValue(d)));

    // Update the axes/gridlines
    // We use the second .call() to remove the axis and just show gridlines
    vis.xAxisG
      .call(vis.xAxis)
      .call(g => g.select('.domain').remove());

    vis.yAxisG
      .call(vis.yAxisL)
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove());

    vis.yAxisGR
      .call(vis.yAxisR)
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove());
  }
}