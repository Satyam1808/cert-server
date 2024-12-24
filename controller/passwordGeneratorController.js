const { generatePassword, generatePassphrase } = require('../utils/generator');

exports.generateSecurePassword = (req, res) => {
  const {
    type = 'password', // password or passphrase
    length = 12, // Default length for passwords
    options = { upper: true, lower: true, digits: true, symbols: true }, // Default options
    numWords = 4, // Default for passphrases
    wordSeparator = '-', // Default word separator
    capitalize = false, // Option to capitalize words
    includeNumber = false, // Option to include number in passphrase
  } = req.body;

  if (type === 'password') {
    const password = generatePassword(length, options);
    return res.json({ password });
  } else if (type === 'passphrase') {
    const passphrase = generatePassphrase(numWords, wordSeparator, capitalize, includeNumber);
    return res.json({ passphrase });
  }

  return res.status(400).json({ error: 'Invalid type. Use "password" or "passphrase".' });
};
