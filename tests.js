const { extractMusicUrl } = require('./src/music/linkParser');
const { play, skip, stop, getQueue } = require('./src/music/player');
const { handleMessageCreate } = require('./src/events/messageCreate');

// linkParser tests
const tests = [
  ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', true],
  ['https://youtu.be/dQw4w9WgXcQ', true],
  ['https://music.youtube.com/watch?v=abc', true],
  ['https://open.spotify.com/track/abc123', true],
  ['https://soundcloud.com/artist/track', true],
  ['https://example.com/not-music', false],
  ['no url here', false],
  ['', false],
  [null, false],
];

let passed = 0;
for (const [input, expected] of tests) {
  const result = extractMusicUrl(input);
  const ok = expected ? result !== null : result === null;
  if (!ok) {
    console.error('FAIL:', JSON.stringify(input), '-> got:', result);
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
