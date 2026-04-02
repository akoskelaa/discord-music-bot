const { extractMusicUrl } = require('../music/linkParser');
const { play, skip, stop, getQueue } = require('../music/player');

const PREFIX = '!';

function handleMessageCreate(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'play': {
      const result = extractMusicUrl(args.join(' '));
      if (!result) {
        message.reply('Please provide a valid YouTube, Spotify, or SoundCloud URL.');
        return;
      }
      play(message, result.url, result.type);
      break;
    }
    case 'skip':
      skip(message);
      break;
    case 'stop':
      stop(message);
      break;
    case 'queue': {
      const queue = getQueue(message.guild.id);
      if (!queue || queue.songs.length === 0) {
        message.reply('The queue is empty.');
        return;
      }
      const list = queue.songs
        .map((song, i) => `${i === 0 ? '▶' : `${i}.`} ${song.title || song.url}`)
        .join('\n');
      message.reply(`**Queue:**\n${list}`);
      break;
    }
    default:
      break;
  }
}

module.exports = { handleMessageCreate };
