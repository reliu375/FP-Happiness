function displayChart(e) {
    d3.selectAll("svg").remove();
    var chosenScale = $("input[name='scaleType']:checked").val();

    var margin = {top: 25, right: 20, bottom: 50, left: 80},
        width = 960 - margin.left - margin.right,
        height = 390 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
    .range([0, width])
    .padding(0.1);

    var linearScale = d3.scaleLinear()
        .range([height, 0]);

    var logScale = d3.scaleLog()
                // .domain([10, 100000]);
                .range([height, 0]);

    var y = linearScale;
    if (chosenScale == "Linear") {
        y = linearScale;
    } else if (chosenScale == "Logarithmic") {
        y = logScale;
    }

    // append the svg object to the body of the page
    // append a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#demographicsChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.select("#demographicsChart").attr("align","center");

    var category = e.srcElement.alt;
    var filename = "./data/demographics/" + category + ".csv";

    // console.log('HI');
    d3.csv(filename, function(d) {
      return d;
    }).then(function(data){
      // format the data
      data.forEach(function(d) {
          d.num_moments = parseInt(d.num_moments);
          d.num_moments = +d.num_moments;
          // console.log(d.num_moments);
      });

      // Scale the range of the data in the domains
      var yAxis;
      x.domain(data.map(function(d) { return d[category]; }));
      if (chosenScale == "Linear") {
          y.domain([0, d3.max(data, function(d) { return d.num_moments; })]);
          yAxis = d3.axisLeft(y);
      } else if (chosenScale == "Logarithmic") {
          y.domain([1, d3.max(data, function(d) { return d.num_moments; })]);
          yAxis = d3.axisLeft(y).ticks(4, ",.0f");
      }

      // append the rectangles for the bar chart
      svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d[category]); })
      .attr("y", function(d) {
          return y(d.num_moments);
      })
      .attr("width", x.bandwidth())
      .attr("height", function(d, i) { return height - y(d.num_moments); });

      // add the x Axis
      svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

      // text label for the x axis
      svg.append("text")
      .attr("transform",
              "translate(" + (width/2) + " ," +
                          (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text(category);

      // add the y Axis
      // var yAxis = d3.axisLeft(y);
      // yAxis.ticks(10, "~s");
      svg.append("g")
      .call(yAxis);

      // text label for the y axis
      svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("# of Moments Submitted");
    });






    document.getElementById("demographicsChart").className = "showChart";
}

function hideChart(e) {
    document.getElementById("demographicsChart").className = "hideChart";
}
