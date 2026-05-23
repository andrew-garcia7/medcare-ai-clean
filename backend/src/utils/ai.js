const detectEmergencyPriority = (text) => {
  const criticalKeywords = ['heart attack', 'stroke', 'unconscious', 'not breathing'];

  for (let word of criticalKeywords) {
    if (text.toLowerCase().includes(word)) {
      return 'critical';
    }
  }

  return 'urgent';
};

module.exports = { detectEmergencyPriority };