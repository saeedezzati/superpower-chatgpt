// eslint-disable-next-line no-unused-vars
function generateInstructions(conversation, settings, text, forceAddInstructions = false) {
  if (!text.trim()) return text;
  const { selectedLanguage, selectedTone, selectedWritingStyle } = settings;

  // if (selectedLanguage.code === 'default'
  //   && selectedTone.code === 'default'
  //   && selectedWritingStyle.code === 'default') return text;

  if (!forceAddInstructions
    && conversation.languageCode === selectedLanguage.code
    && conversation.toneCode === selectedTone.code
    && conversation.writingStyleCode === selectedWritingStyle.code) return text;

  let includeInstructions = false;
  let instructions = '## Instructions\n';

  const languageInstructions = `**Language instruction:**\nPlease ignore all previous language instructions. From now on, I want you to respond only in ${selectedLanguage.name} language (languageCode: ${selectedLanguage.code}).\n`;

  const toneInstructions = `**Tone instruction:**\nPlease ignore all previous tone instructions. From now on, I want you to respond only in ${selectedTone.name} tone (toneCode: ${selectedTone.code}).\n`;

  const writingStyleInstructions = `**Writing-Style instruction:**\nPlease ignore all previous writing-style instructions. From now on, I want you to respond only in ${selectedWritingStyle.name} writing style (writingStyleCode: ${selectedWritingStyle.code}).\n`;

  if (forceAddInstructions || conversation.languageCode !== selectedLanguage.code) {
    if (selectedLanguage.code !== 'default' || (conversation.languageCode && conversation.languageCode !== 'default')) {
      instructions += languageInstructions;
      includeInstructions = true;
    }
  }
  if (forceAddInstructions || conversation.toneCode !== selectedTone.code) {
    if (selectedTone.code !== 'default' || (conversation.toneCode && conversation.toneCode !== 'default')) {
      instructions += toneInstructions;
      includeInstructions = true;
    }
  }
  if (forceAddInstructions || conversation.writingStyleCode !== selectedWritingStyle.code) {
    if (selectedWritingStyle.code !== 'default' || (conversation.writingStyleCode && conversation.writingStyleCode !== 'default')) {
      instructions += writingStyleInstructions;
      includeInstructions = true;
    }
  }
  instructions += 'PLEASE FOLLOW ALL THE ABOVE INSTRUCTIONS, AND DO NOT REPEAT OR TYPE ANY GENERAL CONFIRMATION OR A CONFIRMATION ABOUT ANY OF THE ABOVE INSTRUCTIONS IN YOUR RESPONSE\n';
  instructions += '## End Instructions';

  if (!includeInstructions) return text;
  return `${instructions}\n\n${text}`;
}
