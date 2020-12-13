const ytdl = require("ytdl-core");

var timeout;

module.exports = {
  execute: async function (message, args, serverQueue, queue) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.channel.send("You're not in a voice channel.");
    }
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT")) {
      return message.channel.send("I can't join that voice channel.");
    }
    if (!permissions.has("SPEAK")) {
      return message.channel.send("I can't speak in that voice channel.");
    }
    var song;
    try {
      song = await getYTInfo(args[1]);
    } catch (err) {
      return message.channel.send(err.message);
    }

    if (!serverQueue) {
      const queueContract = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
      };
      // Set queue
      queue.set(message.guild.id, queueContract);
      // push song to array
      queueContract.songs.push(song);

      // join voice chat and play song
      try {
        var connection = await voiceChannel.join();
        queueContract.connection = connection;
        play(message.guild, queueContract.songs[0], queue);
      } catch (err) {
        console.log(err.message);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else if (serverQueue.songs.length === 0) {
      clearTimeout(timeout);
      play(message.guild, song, queue);
    } else {
      serverQueue.songs.push(song);
      //   console.log(serverQueue.songs);
      return message.channel.send(
        `"${song.title}" added.\nQueue size: ${serverQueue.songs.length}`
      );
    }
  },

  skip: function (message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send("You are not in a voice channel.");
    if (!serverQueue)
      return message.channel.send("I'm not playing music right now.");
    serverQueue.connection.dispatcher.end();
  },

  end: function (message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send("You are not in a voice channel.");
    if (!serverQueue)
      return message.channel.send("I'm not playing music right now.");
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
    return message.channel.send("Ok.");
  },
};

function play(guild, song, queue) {
  const serverQueue = queue.get(guild.id);
  //   console.log(queue);
  if (!song) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(function () {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
    }, 60 * 1000);
    return;
  }
  //   console.log(song);
  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0], queue);
    })
    .on("error", (error) => serverQueue.songs[0]);
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Playing: "${song.title}"`);
}

async function getYTInfo(link) {
  const songInfo = await ytdl.getInfo(link);
  return {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };
}
