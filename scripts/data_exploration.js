var exploreDict = {
                    "exercise": ["Exercise", "~doing yoga this morning was so calming~", "lightsalmon"],
                    "enjoy_the_moment": ["Enjoy the Moment", "~i sang my heart out in the shower today~", "plum"],
                    "nature": ["Nature", "~biking through the parks was so relaxing~", "lightgreen"],
                    "achievement": ["Achievement", "~my boss told me that my proposal was creative and innovative~", "darkgoldenrod"],
                    "bonding": ["Bonding", "~i made plans see a new movie with friends this weekend~", "lightseagreen"],
                    "affection": ["Affection", "~my boyfriend took me on a romantic date last night~", "palevioletred"],
                    "leisure": ["Leisure", "~my favorite show aired a new, exciting episode~", "lightskyblue"],
                }

var genderDict = {"female": "f", "male": "m", "other gender": "o"};
var parenthoodDict = {"not a parent": "n", "parent": "y"};
var countryDict = {"USA": "USA",
                   "India": "IND",
                   "Venezuela": "VEN",
                   "Canada": "CAN",
                   "United Kingdom": "GBR",
                   "Philippines": "PHL",
                   "Mexico": "MEX",
                   "Nigeria": "VNM",
                   "Brazil": "BRA",
                   "Australia": "AUS"};

var chosenCategory;

/* Prevent click on sticky note from doing anything */
$('.invalidLink').click(function(e) {
    e.preventDefault();
});

var data_promise = d3.csv("data/all_moments.csv", function(d) {
  return {
    momentID: d.hmid,
    userID: d.wid,
    text: d.cleaned_hm,
    category: d.predicted_category,
    age: d.age,
    country: d.country,
    gender: d.gender,
    marital: d.marital,
    parenthood: d.parenthood,
    length: d.char_len
  };
});

// console.log(data_promise);

function resetDemographicFilters() {
    $("#country-explore").val("").change();
    $("#gender-explore").val("").change();
    $("#marital-status-explore").val("").change();
    $("#parenthood-explore").val("").change();
    $("#age-explore").val("").change();
}

function loadExplorationData(e){
    chosenCategory = e.srcElement.alt;
    var chosenInfo = exploreDict[chosenCategory];
    document.getElementById("explore_chosen_category").innerHTML = chosenInfo[0];
    document.getElementById("explore_chosen_category").style.color = chosenInfo[2];
    resetDemographicFilters();
    document.getElementById("filter_by_category").className = "showExploreDiv";
    filterHappyMoments(chosenCategory);
}

function displayExploreData(e) {
    var category = e.srcElement.alt;
    var exploreID = category + "Label";
    document.getElementById(exploreID).style.visibility = "visible";
}

function hideExploreData(e) {
    var category = e.srcElement.alt;
    var exploreID = category + "Label";
    document.getElementById(exploreID).style.visibility = "hidden";
}

function changeDemographicOptions(){
    document.getElementById("explore-demographic").innerHTML = "Set Filters";
}

function filterExplorationData(e) {
    var countrySelect = document.getElementById("country-explore");
    if (countrySelect.options[countrySelect.selectedIndex] != undefined) {
        var country = countrySelect.options[countrySelect.selectedIndex].value;
        var countryTxt = countrySelect.options[countrySelect.selectedIndex].text;
    }

    var genderSelect = document.getElementById("gender-explore");
    if (genderSelect.options[genderSelect.selectedIndex] != undefined) {
        var gender = genderSelect.options[genderSelect.selectedIndex].value;
        var genderTxt = genderSelect.options[genderSelect.selectedIndex].text;
    }

    var maritalSelect = document.getElementById("marital-status-explore");
    if (maritalSelect.options[maritalSelect.selectedIndex] != undefined) {
        var marital = maritalSelect.options[maritalSelect.selectedIndex].value;
        var maritalTxt = maritalSelect.options[maritalSelect.selectedIndex].text;
    }

    var parenthoodSelect = document.getElementById("parenthood-explore");
    if (parenthoodSelect.options[parenthoodSelect.selectedIndex] != undefined) {
        var parenthood = parenthoodSelect.options[parenthoodSelect.selectedIndex].value;
        var parenthoodTxt = parenthoodSelect.options[parenthoodSelect.selectedIndex].text;
    }

    var ageSelect = document.getElementById("age-explore");
    if (ageSelect.options[ageSelect.selectedIndex] != undefined) {
        var ageLower = ageSelect.options[ageSelect.selectedIndex].value;
        var ageTxt = ageSelect.options[ageSelect.selectedIndex].text; // includes range
    }

    var filter_keys = ['country', 'gender', 'marital', 'parenthood', 'age'];
    var filters = [countryTxt, genderTxt, maritalTxt, parenthoodTxt, ageTxt];
    // console.log("filters: ", filters)
    var demographicFilters = [];
    for (var f=0; f<filters.length; f++) {
        demographicFilters.push(filters[f]);
    }
    filterHappyMoments(chosenCategory, demographicFilters);
    document.getElementById("explore-demographic").innerHTML = "See More Moments"
    // document.getElementById("filtered_happy_moments").innerHTML = countryTxt + ", " + genderTxt + ", " + maritalTxt + ", " + parenthoodTxt + ", " + ageTxt;
}

function filterHappyMoments(category, demographics=[]) {
    // console.time("data");
    data_promise.then(function(data){

      var filtered_data = data.filter(moment => moment.category === category);
      filtered_data = filtered_data.filter(moment => moment.length <= 65);
      var filter_keys = ['country', 'gender', 'marital', 'parenthood', 'age'];

      if (demographics.length > 0) {
          // country
          if (demographics[0] !== undefined && demographics[0] !== "") {
              filtered_data = filtered_data.filter(moment => moment.country === countryDict[demographics[0]]);
          }

          // gender
          if (demographics[1] !== undefined && demographics[1] !== "") {
              filtered_data = filtered_data.filter(moment => moment.gender === genderDict[demographics[1]]);
          }

          // marital status
          if (demographics[2] !== undefined && demographics[2] !== "") {
              filtered_data = filtered_data.filter(moment => moment.marital === demographics[2]);
          }

          // parenthood
          if (demographics[3] !== undefined && demographics[3] !== "") {
              filtered_data = filtered_data.filter(moment => moment.parenthood === parenthoodDict[demographics[3]]);
          }

          // age
          if (demographics[4] !== undefined && demographics[4] !== "") {
              var lower = demographics[4].substr(0, 2);
              lower = parseInt(lower);
              filtered_data = filtered_data.filter(moment => (moment.age >= lower && moment.age < lower + 10));
          }
      }

      // color the stickies based on category
      var catColorId = category + "Color"; 
      var catColor = document.getElementById(catColorId).style["background-color"]; 
      var stickyElements = document.getElementsByClassName("categoryColor"); 
      for(var i=0; i<stickyElements.length; i++) {
          stickyElements[i].style.background = catColor; 
      }

      // shuffle the filtered data
      shuffle(filtered_data);
      var text = "";

      if (filtered_data.length === 0) {
        document.getElementById("notEnoughData").style.visibility = "visible";
        document.getElementById("explore-demographic").innerHTML = "Set Filters";
        for(var n=0; n<6; n++) {
            var id = (n+1).toString();
            var idName = "sticky" + id;
            document.getElementById(idName).innerHTML = "";
        }
      } else {
            document.getElementById("notEnoughData").style.visibility = "hidden";
            var ix = 0;
            for(ix = 0; ix < Math.min(filtered_data.length, 6); ix++){
                text = filtered_data[ix].text;
                var id = (ix+1).toString();
                var idName = "sticky" + id;
                document.getElementById(idName).innerHTML = text;
            }
            for(var jx=ix; jx<6; jx++) {
                var id = (jx+1).toString();
                var idName = "sticky" + id;
                document.getElementById(idName).innerHTML = "";
            }
      }

    //   console.timeEnd("data");
    });

}

function shuffle(list) {
  // https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
  for(let i = list.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * i)
    const temp = list[i]
    list[i] = list[j]
    list[j] = temp
  }
}
