/**
 * Load data from CSV file asynchronously and visualize it
 */
d3.csv('data/rawdata.csv')
  .then(data => {
    
    // Convert strings to numbers
    data.forEach(d => {
      d.trial = +d.trial;
      d.efficacy = +d.efficacy;
    });

    // Initialize plot
    const scatterplot = new Scatterplot({parentElement: '#vis', containerWidth: 500, containerHeight: 250}, data);
    
    // Show plot
    scatterplot.updateVis()
  })
  .catch(error => console.error(error));

