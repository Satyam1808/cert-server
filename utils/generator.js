const crypto = require('crypto');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

// Generate a random password
exports.generatePassword = (length, options) => {
  const charSets = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%^&*',
  };

  let characters = '';
  if (options.upper) characters += charSets.upper;
  if (options.lower) characters += charSets.lower;
  if (options.digits) characters += charSets.digits;
  if (options.symbols) characters += charSets.symbols;

  if (!characters) {
    throw new Error('At least one character type must be selected.');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    password += characters[randomIndex];
  }

  return password;
};


exports.generatePassphrase = (numWords, wordSeparator = '-', capitalize = false, includeNumber = false) => {
    const wordList = [];
  
    // Generate random words using the uniqueNamesGenerator
    for (let i = 0; i < numWords; i++) {
      let randomWord = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals], // Use three dictionaries for variety
        separator: wordSeparator, // Add a custom separator for readability
        length: 1, // One word at a time
      });
  
      // Capitalize the word if the option is enabled
      if (capitalize) {
        randomWord = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
      }
  
      // Optionally include a number in the passphrase
      if (includeNumber) {
        randomWord += Math.floor(Math.random() * 10); // Add a random number (0-9)
      }
  
      wordList.push(randomWord);
    }
  
    // Combine the generated words into a passphrase
    return wordList.join(wordSeparator);
  };