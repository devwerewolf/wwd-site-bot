// Configure our environment variables
require("dotenv").config();

// Imports
const path = require("path");
const fastify = require('fastify')({ logger: true });
const { decodeToBigInt } = require("./utils/recode-ID");
const extractData = require("./utils/extract-data");
const { DiscordClient, CommandPrefix } = require("./constants/Discord");
const { Port } = require("./constants/ServerConfig");

// Fastify routes
const routes = async () => {
  await fastify.register(require('middie'));
  fastify.use(require('cors')());

  fastify.get("/", async (request, reply) => {
    return {
      timestamp: new Date(),
      status: "🌕🐺💻"
    }
  });

  fastify.get("/:server64", async (request, reply) => {
    const { server64 } = request.params;
    let data = null;

    if (server64) {
      const serverID = decodeToBigInt(server64).toString();
      data = await extractData(serverID);
    }

    return data;
  });
  
  fastify.get("/:server64/discord", async (request, reply) => {
    const { server64 } = request.params;
    let invite = null;
    
    if (server64) {
      const serverID = decodeToBigInt(server64).toString();
      const guild = await DiscordClient.guilds.fetch(serverID);
      const channels = guild.channels.cache;
      const generalChannel = channels.find((channel) => channel.name === "general");
      invite = await generalChannel.createInvite();
    }
    
    return invite;
  })
}

// Discord bot
const bot = async () => {
  DiscordClient.once("ready", () => {
    console.log("Discord bot is ready!");
  });

  DiscordClient.on("message", (message) => {
    const messageIsCommand = message.content.startsWith(CommandPrefix);

    if (messageIsCommand) {
      const commandName = 
        message.content.slice(CommandPrefix.length)
        .split(" ")[0]
        .toLowerCase();
      const commandPath = path.join(__dirname, "commands", commandName + ".js");

      try {
        const executeCommand = require(commandPath);
        const commandArgs = 
          message.content.split(" ")
          .slice(1)
          .filter((piece) => !!piece);
        const botResponse = executeCommand({message, commandArgs}) || "Acknowledged.";
  
        message.channel.send(botResponse);
      }
      catch (e) {
        console.log(e, "\n❌: " + message.content);

        // switch (e.code) {
        //   case "MODULE_NOT_FOUND": return message.channel.send(`Command not recognized: ${commandName}`);
        // }
      }
    }
  });

  DiscordClient.login(process.env.DISCORD_BOT_TOKEN);
}

// Server
const start = async () => {
  try {
    await routes();
    await bot();
    await fastify.listen(Port);
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()