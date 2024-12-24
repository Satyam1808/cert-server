exports.getSuggestions = (password) => {
  if (!/[A-Z]/.test(password)) return 'Include at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Add lowercase letters.';
  if (!/[0-9]/.test(password)) return 'Use some numbers.';
  if (!/[\W_]/.test(password)) return 'Include symbols or special characters (e.g., @, #, $, %).';
  if (password.length < 12) return 'Make your password longer (12+ characters).';
  return 'No suggestions.'; // No suggestions if all conditions are met
};

  
  
  exports.getEngagingFeedback = (score, password) => {
    const feedbackOptions = [
      'Your password is practically inviting intruders. Let’s make it stronger!',
      'Not great. Your password needs some work to be secure.',
      'This password is okay, but there’s room for improvement.',
      'Good job! This password is fairly strong.',
      'Excellent! Your password is highly secure. Keep it safe and unique.',
    ];
  
    // Map score (0–10) to feedback index (0–4)
    const feedbackIndex = Math.min(Math.floor(score / 2), feedbackOptions.length - 1);
  
    // Add dynamic encouragement based on the user's password
    let encouragement = '';
    if (password.length < 8) encouragement += ' Consider adding more characters to make it harder to guess.';
    if (!/[A-Z]/.test(password)) encouragement += ' A mix of uppercase and lowercase letters would strengthen it further.';
    if (!/[0-9]/.test(password)) encouragement += ' Adding numbers can increase its complexity.';
    if (!/[\W_]/.test(password)) encouragement += ' Including symbols (e.g., @, #, %, &) makes it even tougher to crack.';
  
    // Generate final feedback message
    return `${feedbackOptions[feedbackIndex]}${encouragement ? ' ' + encouragement.trim() : ''}`;
  };
  