const PLAYLIST_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/playlist\?list=[^\s]+/,
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s]*list=[^\s]+/,
  /(?:https?:\/\/)?(?:www\.)?music\.youtube\.com\/playlist\?list=[^\s]+/,
  /(?:https?:\/\/)?open\.spotify\.com\/album\/[^\s]+/,
  /(?:https?:\/\/)?open\.spotify\.com\/playlist\/[^\s]+/,
  /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[^\s]+\/sets\/[^\s]+/,
];

const TRACK_PATTERNS = [
  /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s]*v=[^\s]+/,
  /(?:https?:\/\/)?youtu\.be\/[^\s]+/,
  /(?:https?:\/\/)?(?:www\.)?music\.youtube\.com\/watch\?[^\s]*v=[^\s]+/,
  /(?:https?:\/\/)?open\.spotify\.com\/track\/[^\s]+/,
  /(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[^\s]+\/[^\s]+/,
];

function extractMusicUrl(text) {
  if (!text) return null;

  for (const pattern of PLAYLIST_PATTERNS) {
    const match = text.match(pattern);
    if (match) return { url: match[0], type: 'playlist' };
  }

  for (const pattern of TRACK_PATTERNS) {
    const match = text.match(pattern);
    if (match) return { url: match[0], type: 'track' };
  }

  return null;
}

module.exports = { extractMusicUrl };
