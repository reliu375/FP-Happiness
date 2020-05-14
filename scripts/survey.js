// Global Constants
var happyMoment; // user happy moment
var happyMomentWords;
var category; // happy moment category
var categoryTxt; // user readable
var country, gender, marital, parenthood, ageLower ;
var countryTxt, genderTxt, maritalTxt, parenthoodTxt, ageTxt;
var categoryToIcon = {
  "affection": "./css/icons/heart-solid.svg",
  "achievement": "./css/icons/trophy-solid.svg",
  "enjoy_the_moment": "./css/icons/cocktail-solid.svg",
  "bonding": "./css/icons/users-solid.svg",
  "leisure": "./css/icons/book-open-solid.svg",
  "nature": "./css/icons/leaf-solid.svg",
  "exercise": "./css/icons/dumbbell-solid.svg"
}

console.log('load survey.js')

function getUserHappyMoment() {
  console.log('getting user hp')
  happyMoment = document.getElementById("user-happy-moment").value;
  // convert to lowercase
  s = happyMoment.toLowerCase();
  // remove punctuation
  s = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  // remove extra whitespace
  s = s.replace(/\s{2,}/g," ");
  // convert string to iterable
  happyMomentWords = new Set(s.split(" "));

  // give user error msg if happy moment or category is empty
  if (s.length == 0 || category == undefined) {
    alert('Please write down a happy moment AND select a category.')
  }
}

function setCategory(categoryId) {
  console.log('setting category')

  // unset opacity of previous
  if (category !== undefined) {
    document.getElementById(category).style = "opacity:0.3";
  }

  // set cateory variable
  category = categoryId;
  categoryTxt = category.replace(/_/g, " ");

  // set opacity of new
  document.getElementById(category).style = "opacity:1.0"
}

function getUserDemographics() {
  console.log('getting demographics')
  // get user demographics
  var countrySelect = document.getElementById("country-user");
  country = countrySelect.options[countrySelect.selectedIndex].value;
  countryTxt = countrySelect.options[countrySelect.selectedIndex].text;

  var genderSelect = document.getElementById("gender-user")
  gender = genderSelect.options[genderSelect.selectedIndex].value;
  genderTxt = genderSelect.options[genderSelect.selectedIndex].text;

  var maritalSelect = document.getElementById("marital-status-user")
  marital = maritalSelect.options[maritalSelect.selectedIndex].value;
  maritalTxt = maritalSelect.options[maritalSelect.selectedIndex].text;


  var parenthoodSelect = document.getElementById("parenthood-user")
  parenthood = parenthoodSelect.options[parenthoodSelect.selectedIndex].value;
  parenthoodTxt = parenthoodSelect.options[parenthoodSelect.selectedIndex].text;


  var ageSelect = document.getElementById("age-user")
  ageLower = ageSelect.options[ageSelect.selectedIndex].value;
  ageTxt = ageSelect.options[ageSelect.selectedIndex].text; // includes range

  return;
}

function showUserResults() {
  console.log('showing results')

  getUserDemographics();

  const note = document.getElementById("result-userHp-note");
  const imgIcon = document.getElementById("noteIcon");
  const momentP = document.getElementById("result-userHp-p"); // TODO: set innerHTML to this?
  // TODO: get text from happyMoment

  // clear previous contents
  // const noteChildren = [...note.childNodes];
  // noteChildren.forEach( child => {
  //   note.removeChild(child)
  // });


  // display user's original moment
  // const momentP = document.createElement('p');
  // momentP.setAttribute('id', 'result-userHp-p')
  // momentP.setAttribute('class', 'lead')
  // const momentTxt = document.createTextNode(happyMoment);
  // momentP.appendChild(momentTxt)
  // note.appendChild(momentP)


  // TODO: add appropriate icon & display categoryStatTxt on hover
  // get moment stats for demographic & category
  $.getJSON('./data/survey/moment_stats.json', function(data) {
    const categoryStats = JSON.parse(JSON.stringify(data));
    const demographicGroup = categoryStats[category][gender][marital][parenthood][country][ageLower];


    const numMoments =  demographicGroup["total_moments"]; // total number of moments written by people in the demographic group
    const percentCategory = demographicGroup["percent_category"] // percent of these moments falling into category

    var categoryStatTxt;
    if (numMoments == 0) {
      categoryStatTxt = `According to the database, nobody else in your demographics has written a happy moment in the <strong>${categoryTxt}</strong> category. Yours is unique!`;
    } else {
      categoryStatTxt = `Out of <strong>${numMoments}</strong> happy moments submitted by people with same demographics as you, </strong>${percentCategory}%</strong> were in category <strong>${categoryTxt}</strong>`;
    }
    document.getElementById("result-userHp-cat").innerHTML = categoryStatTxt;
    // console.log('category stat: ', categoryStatTxt)
  });

  // TODO: for each word in happyMomentKeywords, add highlight to text
  // highlight all keywords used in moment
  $.getJSON('./data/survey/all-keywords.json', function(data) {
    const allKeywords = new Set(JSON.parse(JSON.stringify(data)));
    const happyMomentKeywords = new Array(); // store words in moment that are keywords

    happyMomentWords.forEach(word => {
      if (allKeywords.has(word)) {
        happyMomentKeywords.push(word)
      }
    });
    console.log('all keywords: ', happyMomentKeywords)
    var returnedText = happyMoment;
    for(var i=0; i<happyMomentKeywords.length; i++) {
      returnedText = highlightSurvey(returnedText, happyMomentKeywords[i]);
    }
    momentP.innerHTML = returnedText;
    imgIcon.src = categoryToIcon[category];
  });

  // TODO: add highlight & hover
  // // highlight top 100 most frequent keywords in moment.  hover to show times used.
  // $.getJSON('./data/survey/top100words-dict.json', function(data) {
  //   const topKeywords = JSON.parse(JSON.stringify(data)); // {word : freq}
  //   const happyMomentTopKeywords = new Array(); // store words in moment that are in top 100 frequent
  //
  //   happyMomentWords.forEach(word => {
  //     if (word in topKeywords) {
  //       happyMomentTopKeywords.push(word)
  //       // TODO: number of times used: topKeywords[word]
  //     }
  //   });
  //   console.log('top keywords: ', happyMomentTopKeywords)
  // });
}

function highlightSurvey(text, word) {
  var lowercaseText = text.toLowerCase();
  var index = lowercaseText.indexOf(word);
  if (index >= 0) {
   return text.substring(0,index) + "<u>" + text.substring(index,index+word.length) + "</u>" + text.substring(index + word.length);
  }
}
