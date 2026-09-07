// Web Speech API Voice Text-To-Speech Helper
export function speakText(text, lang = 'hi') {
  // Speech synthesis disabled
  return;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
