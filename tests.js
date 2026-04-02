const { extractMusicUrl } = require('./src/music/linkParser');
const { play, skip, stop, getQueue } = require('./src/music/player');
const { handleMessageCreate } = require('./src/events/messageCreate');

// linkParser tests
const tests = [
  // Track URLs
  ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'track'],
  ['https://youtu.be/dQw4w9WgXcQ', 'track'],
  ['https://music.youtube.com/watch?v=abc', 'track'],
  ['https://open.spotify.com/track/abc123', 'track'],
  ['https://soundcloud.com/artist/track', 'track'],
  // Playlist URLs
  ['https://youtube.com/playlist?list=PLxxx', 'playlist'],
  ['https://www.youtube.com/watch?v=abc&list=PLxxx', 'playlist'],
  ['https://music.youtube.com/playlist?list=xxx', 'playlist'],
  ['https://open.spotify.com/album/abc123', 'playlist'],
  ['https://open.spotify.com/playlist/abc123', 'playlist'],
  ['https://soundcloud.com/artist/sets/my-set', 'playlist'],
  // Invalid URLs
  ['https://example.com/not-music', null],
  ['no url here', null],
  ['', null],
  [null, null],
];

let passed = 0;
for (const [input, expectedType] of tests) {
  const result = extractMusicUrl(input);
  let ok;
  if (expectedType === null) {
    ok = result === null;
  } else {
    ok = result !== null && result.type === expectedType && typeof result.url === 'string';
  }
  if (!ok) {
    console.error('FAIL:', JSON.stringify(input), '-> got:', JSON.stringify(result), ', expected type:', expectedType);
  } else {
    passed++;
  }
}
console.log(`linkParser: ${passed}/${tests.length} passed`);

// Verify all exports are functions
const fns = { handleMessageCreate, play, skip, stop, getQueue };
for (const [name, fn] of Object.entries(fns)) {
  if (typeof fn !== 'function') {
    console.error(`FAIL: ${name} is ${typeof fn}, expected function`);
  }
}
console.log('All exports verified as functions');
