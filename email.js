var findEmails = require('find-emails-in-string');

findEmails("Sentence with email@example.com.");
// => ["email@example.com"]

console.log(findEmails("Sentence with multiple@example.com and another@example.com."));
// => ["multiple@example.com", "another@example.com"]

//=> Set {'sindresorhus@gmail.com', 'unicorn@rainbow.cake'}
