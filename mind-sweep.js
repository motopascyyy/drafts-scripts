'use strict';



var fs = require('fs');

try {
    var data = fs.readFileSync('prompts-file.txt', 'utf8');
} catch(e) {
    console.log('Error:', e.stack);
}
let prompts = data.split("\n");

for (let i = 0; i < prompts.length; i++) {
    let item = prompts[i];
    if (item.startsWith("\t")){
        console.log("key: ", item);
    } else {
        console.log("title: ", item);
    }
}