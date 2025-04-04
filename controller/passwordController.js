const zxcvbn = require('zxcvbn');
const { getSuggestions, getEngagingFeedback } = require('../utils/suggestions');

exports.checkPasswordStrength = (req, res) => {
  const { password } = req.body;

  if (!password) return res.status(400).json({ error: 'Password is required.' });

  const analysis = zxcvbn(password);
  const scaledScore = Math.round((analysis.score / 4) * 10);
  const crackTimeSeconds = analysis.crack_times_seconds.online_no_throttling_10_per_second;
  const estimatedCrackTime = formatCrackTime(crackTimeSeconds);
  const feedback = getEngagingFeedback(analysis.score, password);
  const suggestion = getSuggestions(password);

  res.json({
    score: scaledScore,
    strength: getStrengthLevel(scaledScore),
    crackTime: estimatedCrackTime,
    feedback,
    suggestion,
  });
};

const getStrengthLevel = (score) => {
  if (score < 3) return 'Very Weak';
  if (score < 5) return 'Weak';
  if (score < 7) return 'Moderate';
  if (score < 9) return 'Strong';
  return 'Very Strong';
};

const formatCrackTime = (seconds) => {
  const units = [
    { label: 'centuries', value: 3155760000 },
    { label: 'million years', value: 31557600 },
    { label: 'years', value: 31557600 },
    { label: 'weeks', value: 604800 },
    { label: 'days', value: 86400 },
    { label: 'hours', value: 3600 },
    { label: 'minutes', value: 60 },
    { label: 'seconds', value: 1 },
  ];

  let formattedValue = '';
  
  for (const unit of units) {
    if (seconds >= unit.value) {
      const value = Math.floor(seconds / unit.value);
      if (value >= 100) {
        return `several ${unit.label}`;
      }
      formattedValue = `${value.toLocaleString()} ${unit.label}`;
      break;
    }
  }

  return formattedValue || 'less than 1 second';
};