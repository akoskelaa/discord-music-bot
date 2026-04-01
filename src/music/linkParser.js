const SUPPORTED_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s]*v=[^\s]+/,
  /(?:https?:\/\/)?youtu\.be\/[^\s]+/,
  /(?:https?:\/\/)?(?:www\.)?music\.youtube\.com\/watch\?[^\s]*v=[^\s]+/,
  /(?:https?:\/\/)?open\.spotify\.com\/track\/[^\s]+/,
  /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[^\s]+\/[^\s]+/,
];

function extractMusicUrl(text) {
  if (!text) return null;

  for (const pattern of SUPPORTED_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return null;
}

module.exports = { extractMusicUrl };
