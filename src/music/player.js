const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');
const playdl = require('play-dl');

const queues = new Map();

function getQueue(guildId) {
  return queues.get(guildId);
}

async function play(message, url) {
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

async function playNext(queue) {
  const song = queue.songs[0];
  if (!song) return;

  const stream = await playdl.stream(song.url);
  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
  });

  queue.player.play(resource);
}

async function fetchSongInfo(url) {
  try {
    const info = await playdl.video_basic_info(url);
    return {
      url,
      title: info.video_details?.title || url,
    };
  } catch {
    return { url, title: url };
  }
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
