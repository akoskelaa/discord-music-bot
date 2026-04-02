const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require('@discordjs/voice');
const { spawn, execFile } = require('child_process');

const queues = new Map();
const MAX_PLAYLIST_SIZE = 200;

function getQueue(guildId) {
  return queues.get(guildId);
}

async function play(message, url, type = 'track') {
  const voiceChannel = message.member?.voice?.channel;
  if (!voiceChannel) {
    message.reply('You need to be in a voice channel to play music.');
    return;
  }

  let queue = queues.get(message.guild.id);

  if (!queue) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: message.guild.id,
      adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    connection.subscribe(player);

    queue = {
      connection,
      player,
      songs: [],
      textChannel: message.channel,
    };

    queues.set(message.guild.id, queue);

    player.on(AudioPlayerStatus.Idle, () => {
      queue.songs.shift();
      if (queue.songs.length > 0) {
        playNext(queue);
      } else {
        queue.connection.destroy();
        queues.delete(message.guild.id);
      }
    });

    player.on('error', (err) => {
      console.error('Audio player error:', err.message);
      queue.textChannel.send(`Playback error: ${err.message}`);
      queue.songs.shift();
      if (queue.songs.length > 0) {
        playNext(queue);
      } else {
        queue.connection.destroy();
        queues.delete(message.guild.id);
      }
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5000),
        ]);
      } catch {
        connection.destroy();
        queues.delete(message.guild.id);
      }
    });
  }

  if (type === 'playlist') {
    message.channel.send('Loading playlist...');

    const songs = await fetchPlaylistInfo(url);
    if (songs.length === 0) {
      message.reply('Could not load any tracks from that playlist.');
      return;
    }

    const wasEmpty = queue.songs.length === 0;
    queue.songs.push(...songs);

    const truncated = songs.length >= MAX_PLAYLIST_SIZE
      ? ` (capped at ${MAX_PLAYLIST_SIZE})`
      : '';
    message.reply(`Added **${songs.length}** songs from playlist to the queue${truncated}.`);

    if (wasEmpty) {
      playNext(queue);
    }
  } else {
    const songInfo = await fetchSongInfo(url);
    if (!songInfo) {
      message.reply('Could not fetch audio for that URL.');
      return;
    }

    queue.songs.push(songInfo);

    if (queue.songs.length === 1) {
      playNext(queue);
      message.reply(`▶ Now playing: **${songInfo.title}**`);
    } else {
      message.reply(`Added to queue (#${queue.songs.length}): **${songInfo.title}**`);
    }
  }
}

async function playNext(queue) {
  const song = queue.songs[0];
  if (!song) return;

  const ytdlp = spawn('yt-dlp', [
    '-f', 'bestaudio',
    '-o', '-',
    '--no-warnings',
    '--quiet',
    song.url,
  ]);

  ytdlp.stderr.on('data', (data) => {
    console.error('yt-dlp:', data.toString());
  });

  const resource = createAudioResource(ytdlp.stdout, {
    inputType: StreamType.Arbitrary,
  });

  queue.player.play(resource);
}

function fetchSongInfo(url) {
  return new Promise((resolve) => {
    execFile('yt-dlp', ['--print', 'title', '--no-warnings', url], (err, stdout) => {
      resolve({ url, title: err ? url : stdout.trim() || url });
    });
  });
}

function fetchPlaylistInfo(url) {
  return new Promise((resolve) => {
    execFile(
      'yt-dlp',
      ['--flat-playlist', '--print', 'url', '--print', 'title', '--no-warnings', url],
      { maxBuffer: 1024 * 1024 * 5 },
      (err, stdout) => {
        if (err || !stdout.trim()) {
          resolve([]);
          return;
        }
        const lines = stdout.trim().split('\n');
        const songs = [];
        for (let i = 0; i < lines.length - 1 && songs.length < MAX_PLAYLIST_SIZE; i += 2) {
          songs.push({
            url: lines[i].trim(),
            title: lines[i + 1]?.trim() || lines[i].trim(),
          });
        }
        resolve(songs);
      }
    );
  });
}

function skip(message) {
  const queue = queues.get(message.guild.id);
  if (!queue || queue.songs.length === 0) {
    message.reply('Nothing to skip.');
    return;
  }
  message.reply(`Skipped: **${queue.songs[0].title}**`);
  queue.player.stop();
}

function stop(message) {
  const queue = queues.get(message.guild.id);
  if (!queue) {
    message.reply('Nothing is playing.');
    return;
  }
  queue.songs = [];
  queue.player.stop();
  queue.connection.destroy();
  queues.delete(message.guild.id);
  message.reply('Stopped playback and cleared the queue.');
}

module.exports = { play, skip, stop, getQueue };
