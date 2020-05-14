var words = [['out',1.0],
    ['just',0.848167539267],
    ['your',0.82722513089],
    ['not',0.759162303665],
    ['have',0.685863874346],
    ['today',0.638743455497],
    ['hai', 0.623036649215],
    ['eventbrite',0.591623]
];

d3.layout.cloud()
    .size([600, 600])
    .words(words
        .map(function(d) {
            return {text: d[0], size: d[1] * 100};}))
        .padding(5)
        .rotate(function() { return ~~(Math.random() * 0) * 90; })
        .font("Impact")
        .fontSize(function(d) { return d.size; })
        .on("end", draw)
        .start();


function draw(words) {
    d3.select("body").append("svg")
    .attr("width", 600)
    .attr("height", 600)
    .append("g")
    .attr("transform", "translate(300,300)")
    .selectAll("text")
    .data(words)
    .enter().append("text")
    .style("font-size", function(d) { return d.size + "px"; })
    .style("font-family", "Impact")
    .style("fill", function(d, i) { return fill(i); })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) { return d.text; });
}
