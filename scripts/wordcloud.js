// source: https://bl.ocks.org/allisonking/ece2f8a08a626b7067381317a385a245#wolfstar.json

var container = "svg";

var w = 700;
var h = 600;



// var wordSize;
// var layout;
var focus;
// var margin;
var svg;

var data_promises = Promise.all([d3.json('data/word_to_index.json'),
                                 d3.csv('data/all_moments.csv'),
                                 d3.json('data/moments_by_topic.json')]);

// console.log(data_promises);

function generate(options) {
    document.getElementById("wordCloudMoment").innerHTML = "";
    if (svg != undefined) {
        // console.log("HERE");
        svg.remove();
    }
    // console.log("HERE AGAIN");
    var wordSize = 12;
    var topic = document.getElementById("topics").value;

    var margin = {top: 70, right: 100, bottom: 0, left: 100},
           w = 1200 - margin.left - margin.right,
           h = 400 - margin.top - margin.bottom;

    svg = d3.select(options.container).append("svg")
              .attr('height', h + margin.top + margin.bottom)
              .attr('width', w + margin.left + margin.right)

    focus = svg.append('g')
        .attr("transform", "translate(" + [w/2, h/2+margin.top] + ")")

    var file;
    if (topic === "all") {
        file = "data/wordcloud/top100words.json"
    } else {
        file = "data/wordcloud/topic_words.json";
    }

	d3.json(file, function(d) {
      return d;
  }).then(function(data) {
      var list_of_words = [];
      if (topic === "all") {
        list_of_words = data;
      } else {
        list_of_words = data[topic];
      //   console.log(list_of_words);
      }

      list_of_words.sort(function(a, b) {return b.freq - a.freq});
      list_of_words = list_of_words.slice(0, 100);

      var length = list_of_words.length;

      for (var t = 0; t < length; t++) {
      var timing = (20 * t) + 100;// subject to change
      list_of_words[t].time = timing;
      }

      // console.log(list_of_words);

      var sizeScale = d3.scaleLinear()
                              .domain([0, d3.max(list_of_words, function(d) { return d.freq} )])
                              .range([10, 50]); // 95 because 100 was causing stuff to be missing


      var layout = d3.layout.cloud().size([w, h])
                      .words(list_of_words)
                      .padding(5)
                      .rotate(function() { return ~~(Math.random() * 2) * 90; })
                      .font("Impact")
                      .fontSize(function(d) { return sizeScale(d.freq); })
                      .on("end",draw)
                      .start();

      // console.log(list_of_words);
  });
}

function draw(words) {
    var fill = d3.scaleOrdinal(d3.schemeSet2);
	// d3.select(container).remove();

    // d3.select("body").append(container)
    //     .attr("width", w)
    //     .attr("height", h)
    //     .append("g")
    //     .attr("transform", "translate(" + [w/2, h/2] + ")")
    focus.selectAll("text")
        .data(words)
        .enter().append("text")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
            .transition()
            .duration(function(d) { return d.time}  )
            .attr('opacity', 1)
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { d['color']=fill(i); return fill(i); })
        .attr("text-anchor", "middle")
            .attr("transform", function(d) {
            return "rotate(" + d.rotate + ")";
            })
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
        .text(function(d) { return d.word; });
}

function handleMouseOver(d) {
  // console.log(data_promises);
  var base = d.y - d.size;

  var group = focus.append('g')
                .attr('id', 'frequency');

  var sample;

  data_promises.then(function(data){
    var word_to_index = data[0];
    var moments = data[1];
    var moments_by_topic = data[2];

    moments = moments.filter(moment => moment.char_len <= 230);

    var topic = document.getElementById("topics").value;

    var set1 = new Set(word_to_index[d.word]);
    if (topic !== 'all') {
      var set2 = new Set(moments_by_topic[topic]);
      var intersect = new Set([...set1].filter(i => set2.has(i)));
    } else {
      var intersect = set1;
    }


    intersect = [...intersect];
    shuffle(intersect);
    if (intersect.length != 0) {
      var id = intersect[0];
      var moment = moments.filter(moment => moment.hmid == id);
      sample = moment[0].cleaned_hm;
      document.getElementById("wordCloudMoment").innerHTML = sample;
      highlight(d.word, d.color);
      // console.log("color:", d);
    } else {
      sample = "";
    }

    group.selectAll('text')
        .data(["# of occurences: " + d.freq.toString()])
        .enter().append('text')
        .attr('x', d.x)
        .attr('y', function(title, i) {
          return (base - i*14);
        })
        .attr('text-anchor', 'middle')
        .text(function(title) { return title; });

    var bbox = group.node().getBBox();
    var bboxPadding = 5;

    // place a white background to see text more clearly
    group.insert('rect', ':first-child')
          .attr('x', bbox.x)
          .attr('y', bbox.y)
          .attr('width', bbox.width + bboxPadding)
          .attr('height', bbox.height + bboxPadding)
          .attr('rx', 10)
          .attr('ry', 10)
          .attr('class', 'label-background-strong');
  });
}

function handleMouseOut(d) {
  d3.select('#frequency').remove();
}

function shuffle(arr) {
  // https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

function highlight(text, color){
  var inputText = document.getElementById("wordCloudMoment");
  // var innerHTML = "Lot likes a lot of lots and lot";
  var innerHTML = inputText.innerHTML;
  var lowercaseHTML = innerHTML.toLowerCase();
  var regexp = RegExp('\\b' + text + '\\b', 'g');
  var newstr = "";
  var match;
  var currentIndex = 0;

  while ((match = regexp.exec(lowercaseHTML)) !== null) {
    newstr += innerHTML.substring(currentIndex, match.index);
    newstr += "<span style='background-color:" + color + "'>"
           + innerHTML.substring(match.index, regexp.lastIndex) + "</span>";
    currentIndex = regexp.lastIndex;
  }

  newstr += innerHTML.substring(currentIndex);

  inputText.innerHTML = newstr;
}
