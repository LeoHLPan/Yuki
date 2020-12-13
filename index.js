const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const config = require("./config.json");
const auth = require("./auth.json");

const client = new Discord.Client();

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

client.on("message", (msg) => {
  if (msg.content.substring(0, 1) === "!") {
    var args = msg.content.substring(1).split(" ");
    var cmd = args[0];

    switch (cmd) {
      case "help":
        help(msg);
        break;
      case "convert":
        class.method(msg, args);
        break;
    }
  }
});

client.login(auth.token);
