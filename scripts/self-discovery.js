
/* Global Variables */
// stores user's selected words from word cloud
var selectedWordsSD = [];
// make categorys list sortable
var sortableSD = Sortable.create(document.getElementById('categories-rank-list'));
// for generating word cloud
var focusSD;

var sd_data_promise = Promise.all([d3.json('./data/word_to_index.json'),
                                d3.json('./data/all_moments.json')])

/**
* Generates Word Cloud that lets user selects words
*/
function generateSD(options) {
  var wcButton = document.getElementById("user-self-demographic");
  wcButton.style.visibility = "hidden";
  var parentDiv = document.getElementById("choose-words")

  var containerSD = "svg";
  var wordSize = 10;

  var margin = {top: 10, right: 10, bottom: 10, left: 10};
  var wSD = parentDiv.clientWidth + 100 - margin.left - margin.right;
  var hSD = parentDiv.clientHeight + 100 - margin.top - margin.bottom;

  var svg = d3.select(options.container).append("svg")
              .attr('width', wSD + margin.left + margin.right)
              .attr('height', hSD + margin.top + margin.bottom)
          // .attr("preserveAspectRatio", "xMinYMin meet")
          // .attr("viewBox", `0 0 ${wSD + margin.left + margin.right} ${hSD + margin.top + margin.bottom}`)

  focusSD = svg.append('g')
               .attr("transform", "translate(" + [wSD/2, hSD/2+margin.top] + ")")

 // TODO: adjust file path
  var file = "./data/self-discovery/select-words.json"

  d3.json(file, function(d) {
    return d;
  }).then(function(data) {

  var list_of_words = data;

  var length = list_of_words.length;

  for (var t = 0; t < length; t++) {
    var timing = (20*t) + 100;
    list_of_words[t].time = timing;
  }

var sizeScale = d3.scaleLinear()
                  .domain([0, d3.max(list_of_words, function(d) { return d.freq })])
                  .range([10,25]) // adjust this to show more/less number of words

var layout = d3.layout.cloud().size([wSD, hSD])
                 .words(list_of_words)
                 .padding(5)
                 .rotate(function() { return ~~(Math.random() * 2) * 90; })
                 .font("Impact")
                 .fontSize(function(d) { return sizeScale(d.freq); }) // constant freq
                 .on("end",drawSD)
                 .start();
 });
}

/** Helper function for drawing word cloud **/
function drawSD(words) {
  var fill = d3.scaleOrdinal(d3.schemeSet2);
  const NUMWORDS = 5; // number of words we let user choose

 // TODO: add onclick & unclick actions
focusSD.selectAll("text")
       .data(words)
       .enter().append("text")
       .style("font-size", function(d) { return d.size + "px"; })
       .style("font-family", "Impact")
       .style("fill", function(d, i) { return fill(i); })
       .attr("text-anchor", "middle")
       .attr("transform", function(d) {
         return "rotate(" + d.rotate + ")";
        })
       .attr("transform", function(d) {
         return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
         })
       .text(function(d) { return d.word; })
       .on("click", function(d) {
         if (selectedWordsSD.length <= NUMWORDS) {
            // console.log("word: ", d.word);
            // console.log("list: ", selectedWordsSD);
           if (selectedWordsSD.includes(d.word)) {
             // unclicking
             var wordIndex = selectedWordsSD.indexOf(d.word);
             if (wordIndex > -1) {
               selectedWordsSD.splice(wordIndex, 1);
             }
             d3.select(this).style('fill', function(d, i) { return fill(i); })
           } else {
             // adding new word
             if (selectedWordsSD.length < NUMWORDS) {
               selectedWordsSD.push(d.word)
               d3.select(this).style('fill', 'black')
             }
           }
         }
         if (selectedWordsSD.length >= NUMWORDS && !selectedWordsSD.includes(d.word)) {
           // if already at word limit & trying to add new word (instead of unclicking)
           alert(`You have already selected ${NUMWORDS} words.`);
         }
       });
}


/**
* Get User's category rankings & selected words
* Displays happy moments that matches settings to sticky notes
*/
function showSDResults() {
  // take top 3 categories
  var rankedCat = sortableSD.toArray();
  var topCat = rankedCat.slice(0,3)

  // 5 words * 3 categories = 15 moments
  // { word : { category : [moments] } }
  resultMoments = new Map();
  selectedWordsSD.forEach(word => {
    resultMoments.set(word, new Map());
    topCat.forEach(cat => {
      resultMoments.get(word).set(cat, []);
    });
  });

  writeToStickies(resultMoments, topCat);

}

function writeToStickies(resultMoments, topCat) {
  // console.log('write to stickies')
  // write moments to stickies
  sd_data_promise.then(function(data){
    const wordToIndex = data[0];
    const momentData = data[1];

    selectedWordsSD.forEach(word => {
      const momentIds = wordToIndex[word];

      momentIds.forEach(hmid => {
        const momentDict = momentData[hmid];
        // if moment found, add to dict if moment category matches
        if (momentDict !== undefined) {
          const momentCat = momentDict["predicted_category"];
          const momentTxt = momentDict["cleaned_hm"];
          if (topCat.includes(momentCat)) {
            // push moment to word-category array
            resultMoments.get(word).get(momentCat).push(momentTxt);
          }
        }
      })
    })
    var ix = 0;
    var jx = 0;
    for (const [key, value] of resultMoments.entries()) { // word, {cat: [moments]}
      ix += 1;
      jx = 0;
      for (const [key2, value2] of value.entries()) { // cat, [moments]
        var index = ix+jx;
        // console.log("index: ", index);
        // var categoryId = "categorySelfSticky" + (index).toString();
        // document.getElementById(categoryId).innerHTML = key2;
        var momentId = "selfSticky" + (index).toString();

        var randomI = Math.floor(Math.random() * Math.floor(value2.length));
        var text = value2[randomI];
        console.log('text: ', text)
        var moment = selfHighlight(text, key, key2);

        document.getElementById(momentId).innerHTML = moment;
        var backgroundId = "categoryStickyBackground" + (index).toString();
        var ogBackgroundId = "self_" + key2;
        var color = document.getElementById(ogBackgroundId).style["background-color"];
        // console.log("color: ", color);
        document.getElementById(backgroundId).style.background = color;
        jx += 5;
      }
    }
  });

}

function selfHighlight(text, word, category) {
  if (category === "enjoy_the_moment") {
    category = "enjoy the moment";
  }
  if (text === undefined) {
    return "Sorry, no happy moment with the word " + "<u>" + word + "</u>" + " in " + category + " exists";
    // return "";
  }
  var lowercaseText = text.toLowerCase();
  var index = lowercaseText.indexOf(word);
  if (index >= 0) {
   return text.substring(0,index) + "<u>" + text.substring(index,index+word.length) + "</u>" + text.substring(index + word.length);
  }
}
