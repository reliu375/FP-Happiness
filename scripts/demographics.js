
// async function setUpChart() {
//     return new Promise((resolve, reject) => {
//         // set the ranges
//         x = d3.scaleBand()
//         .range([0, width])
//         .padding(0.1);

//         var linearScale = d3.scaleLinear()
//             .range([height, 0]);

//         var logScale = d3.scaleLog()
//                     .domain([10, 100000]);

//         if (result == "Linear") {
//             y = linearScale;
//         } else if (result == "Logarithmic") {
//             y = logScale;
//         }

//         // append the svg object to the body of the page
//         // append a 'group' element to 'svg'
//         // moves the 'group' element to the top left margin
//         svg = d3.select("#demographicsChart").append("svg")
//             .attr("width", width + margin.left + margin.right)
//             .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//             .attr("transform",
//                 "translate(" + margin.left + "," + margin.top + ")");
//         resolve();
//     });
// }

// Function to Display Demographics Chart
async function displayChart(e) {

    let promise = new Promise((resolve, reject) => {
        var chosenScale = $("input[name='scaleType']:checked").val();
        // console.log(chosenScale);
        resolve(chosenScale);
    });

    promise.then(function(result) {
        // console.log(result);
        let promise2 = new Promise((resolve, reject) => {

            // set the ranges
            var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

            var linearScale = d3.scaleLinear()
                .range([height, 0]);

            var logScale = d3.scaleLog()
                        .domain([10, 100000]);

            var y = linearScale;
            if (result == "Linear") {
                y = linearScale;
            } else if (result == "Logarithmic") {
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
            resolve([x, y, svg]);
        });

        promise2.then(function(result2) {
            console.log(result2);
            var x = result2[0];
            var y = result2[1];
            var svg = result2[2];

            d3.selectAll("svg").remove();

            d3.select("#demographicsChart").attr("align","center");

            var category = e.srcElement.alt;
            var filename = "../data/" + category + ".csv";

            d3.csv(filename, function(error, data) {
                if (error) throw error;

                // format the data
                data.forEach(function(d) {
                    d.num_moments = parseInt(d.num_moments);
                    d.num_moments = +d.num_moments;
                });

                // Scale the range of the data in the domains
                x.domain(data.map(function(d) { return d[category]; }));
                y.domain([0, d3.max(data, function(d) { return d.num_moments; })]);

                // append the rectangles for the bar chart
                svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d[category]); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) { return y(d.num_moments); })
                .attr("height", function(d) { return height - y(d.num_moments); });

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
                svg.append("g")
                .call(d3.axisLeft(y));

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
            console.log(document.getElementById("demographicsChart").className);
        });
    });

    // let promise = new Promise((resolve, reject) => {

    //     let inner_promise = new Promise((resolve, reject) => {
    //         var chosenScale = document.getElementById("scaleToggle").value;
    //         resolve(chosenScale);
    //     });

    //     const result1 = await inner_promise;
    //     console.log(result1);

    //     // set the ranges
    //     var x = d3.scaleBand()
    //     .range([0, width])
    //     .padding(0.1);

    //     var linearScale = d3.scaleLinear()
    //         .range([height, 0]);

    //     var logScale = d3.scaleLog()
    //                 .domain([10, 100000]);

    //     var y = linearScale;
    //     if (result1 == "Linear") {
    //         y = linearScale;
    //     } else if (result1 == "Logarithmic") {
    //         y = logScale;
    //     }

    //     // append the svg object to the body of the page
    //     // append a 'group' element to 'svg'
    //     // moves the 'group' element to the top left margin
    //     var svg = d3.select("#demographicsChart").append("svg")
    //         .attr("width", width + margin.left + margin.right)
    //         .attr("height", height + margin.top + margin.bottom)
    //     .append("g")
    //         .attr("transform",
    //             "translate(" + margin.left + "," + margin.top + ")");
    //     resolve([x, y, svg]);
    // });

    // const result2 = await promise;
    // console.log(result2);

    // d3.selectAll("svg").remove();

    // d3.select("#demographicsChart").attr("align","center");

    // var category = e.srcElement.alt;
    // var filename = "../data/" + category + ".csv";

    // d3.csv(filename, function(error, data) {
    //     if (error) throw error;

    //     // format the data
    //     data.forEach(function(d) {
    //         d.num_moments = parseInt(d.num_moments);
    //         d.num_moments = +d.num_moments;
    //     });

    //     // Scale the range of the data in the domains
    //     x.domain(data.map(function(d) { return d[category]; }));
    //     y.domain([0, d3.max(data, function(d) { return d.num_moments; })]);

    //     // append the rectangles for the bar chart
    //     svg.selectAll(".bar")
    //     .data(data)
    //     .enter().append("rect")
    //     .attr("class", "bar")
    //     .attr("x", function(d) { return x(d[category]); })
    //     .attr("width", x.bandwidth())
    //     .attr("y", function(d) { return y(d.num_moments); })
    //     .attr("height", function(d) { return height - y(d.num_moments); });

    //     // add the x Axis
    //     svg.append("g")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(x));

    //     // text label for the x axis
    //     svg.append("text")
    //     .attr("transform",
    //             "translate(" + (width/2) + " ," +
    //                         (height + margin.top + 20) + ")")
    //     .style("text-anchor", "middle")
    //     .text(category);

    //     // add the y Axis
    //     svg.append("g")
    //     .call(d3.axisLeft(y));

    //     // text label for the y axis
    //     svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left)
    //     .attr("x",0 - (height / 2))
    //     .attr("dy", "1em")
    //     .style("text-anchor", "middle")
    //     .text("# of Moments Submitted");

    // });
    // document.getElementById("demographicsChart").className = "showChart";
}

// Function to Hide Demographics Chart
async function hideChart(e) {
    document.getElementById("demographicsChart").className = "hideChart";
}

// async function setScale() {
//     return new Promise((resolve, reject) => {
//         var chosenScale = document.getElementById("scaleToggle").value;
//         // if (chosenScale == "Linear") {
//         //     y = linearScale;
//         // } else if (chosenScale == "Logarithmics") {
//         //     y = logScale;
//         // }
//         resolve(chosenScale);
//     });
// }
