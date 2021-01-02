// See online documentation for examples
// https://docs.getdrafts.com/docs/actions/scripting


let fullWeekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
let shortWeekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
let timeUnit = ["minutes", "hours", "days", "weeks", "months", "week", "month", "year"];
let increment = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
// Get list of people from Stored Draft to better parse the text for the actual people I need to tag
let peopleDraft = {
	"Alex":"Alex",
	"Brian":"Brian Wu",
	"Caroline":"Caroline",
	// "Bosman":"Dan Bosman",
    // "Dan":"Dan Bosman",
    "Dan Bosman":"Dan Bosman",
	"Danny":"Danny",
	"David":"David Z",
	"Izzy":"Izzy",
	"Jack":"Jack",
	"Jiayi":"Jiayi",
	"Janice":"Janice",
    "Kat":"Kat",
    "Katherine":"Kat",
	"Seb":"Seb",
	"Tao":"Tao",
	"YY":"YY",
	"Yolana":"YY",
	"Ying":"Ying",
	"Yee":"Yee"
};

let input = "- Dan Bosman does something with Brian by interesing\n- Brian does another thing\n- Do something by a time\n- Kat does akfsdfklhds\n- Kat does something with Brian interesing by Tuesday\n- Kat does something with Brian interesing by 5:00 PM"
// let peopleDraft = JSON.parse(Draft.find("D832E9CF-05CB-4CA2-B9BB-7D1BCE4A2675").processTemplate("[[body]]"));

// let input = editor.getSelectedText();


let draftLines = input.split("\n");
let updatedContent = "";
for (let i = 0; i < draftLines.length; i++) {
  let updatedLine = newTaskWithContexts(draftLines[i]);
  draftLines[i] = updatedLine;
  updatedContent += draftLines[i] + "\n";
}
// editor.setSelectedText(updatedContent);

function parsePeople (inputLine) {
  
  let results = [];
  for (const key of Object.keys(peopleDraft)) {
    let regexp = new RegExp("\\b" + key + "\\b");
    let personExists = regexp.test(inputLine);
    if (personExists) {
    //   console.log ("Person: " + key + " links to " + peopleDraft[key] + " which is needed in this task")
    //   results.push("People: " + peopleDraft[key]);
      results.push(key);
    }
  }
  return results;
  
}

function getPeopleTags(inputLine) {
    let keys = parsePeople(inputLine);
    let results = [];
    for (const key of keys) {
        results.push("People: " + peopleDraft[key]);
    }
    return results;
}

function isWaitingForTask (inputLine) {
//   let personFound = peopleDraft[inputArray[1].trim()];
  let personFound = parsePeople(inputLine);
  let strippedTask = inputLine.substring(2);
  if (personFound != null) {
    for (let i = 0; i < personFound.length; i++) {
        if (strippedTask.startsWith(personFound[i])){
            console.log ("Waiting For: " + personFound[i]); 
            return true;
        }
    }
  }
	return false;
}

function parseOutDueDate (inputArray) {
  let lastItem = inputArray[inputArray.length-1].trim();
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (lastItem.toLowerCase() == daysOfWeek[i].toLowerCase()) {
       due = "@due(" + daysOfWeek[i] + ")";  
       return due;
    }
  }
}

function isEmailTask(inputString) {
    
    if (!isWaitingForTask(inputString)) {
        let inputArray = inputString.trim().split(" ");
        let firstWord = inputArray[1].toLowerCase();
        if (firstWord == "send" || firstWord == "email" || firstWord == "message") {
            return true;
    }
  }
  return false;
}


function smartParseOutDueDate (inputString) {
  let inputArray = inputString.trim().split(" ");

  let indexIn = inputArray.lastIndexOf("in");
  let indexBy = inputArray.lastIndexOf("by");
  let indexOn = inputArray.lastIndexOf("on");
  let indexAt = inputArray.lastIndexOf("at");

  let lastIndex = Math.max.apply(Math, [indexIn, indexBy, indexOn, indexAt]);
//   console.log ("Max index was: " + lastIndex + " for " + inputArray[lastIndex]);

let result = "";
  if (lastIndex > 0 && lastIndex < inputArray.length-1) {
    let dateStrToParse = "";
      for (let i = lastIndex + 1; i < inputArray.length; i++) {
        dateStrToParse += inputArray[i] + " ";
    }
    dateStrToParse = dateStrToParse.trim();
    let isDate = isADate(dateStrToParse);
    console.log("Trying to parse: " + dateStrToParse + " - Is it a date: " + isDate);
    if (isDate) {
      result = "@due(";
      if (fullWeekDays.includes(dateStrToParse.trim() || shortWeekDays.includes(dateStrToParse.trim()))) {
        dateStrToParse += ", 4:30 PM";
      } 
      result += dateStrToParse.trim();
      result += ")";
    }
  }
  return result;
}

function isADate(inputString) {
  let result = false;


  let d = new Date(inputString);
  if (d instanceof Date && !isNaN(d)) {
    return true;
  } else if (fullWeekDays.includes(inputString.trim())) {
    return true;
  } else if (shortWeekDays.includes(inputString.trim())) {
    return true;
  } else {
    return false;
  }
}

function newTaskWithContexts (inputString) {
  let inputArray = inputString.trim().split(" ");
  let result = inputString;
  if (inputArray[0] == "-") {
    let tags = "@tags(";
    if (isWaitingForTask(inputString)){
      tags+="Waiting,";
    } else if (isEmailTask(inputString)){
      tags+="Email,";
    }
    let peopleArr = getPeopleTags(inputString.trim());
    for (let i = 0; i < peopleArr.length; i++) {
      if (i != peopleArr.length - 1){
        tags+= peopleArr[i]+",";
      } else {
        tags+= peopleArr[i];
      }
    }
    tags += ")";
    let due = smartParseOutDueDate(inputString);
    result = inputString + " " + tags + " " + due;
  }
  console.log(result);
  return result;
}
