const Discord = require("discord.js");
const config = require("./config.json");
const auth = require("./auth.json");
const play = require("./player");

const client = new Discord.Client();
const queue = new Map();

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});
client.on("reconnecting", () => {
  console.log("Reconnecting...");
});
client.on("disconnect", () => {
  console.log("Disconnected");
});

help = (msg) => {
  msg.channel.send("Add help message here...");
};

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith(config.prefix)) return;

  const serverQueue = queue.get(msg.guild.id);

  var args = msg.content.substring(1).split(" ");
  var cmd = args[0];

  switch (cmd) {
    case "help":
      help(msg);
      break;
    case "play":
      play.execute(msg, args, serverQueue, queue);
      break;
    case "skip":
      play.skip(msg, serverQueue);
      break;
    case "end":
      play.end(msg, serverQueue);
      break;
  }
});

client.login(auth.token);
