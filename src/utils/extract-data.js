const { DiscordClient } = require("../constants/Discord");
const yaml = require('js-yaml');

module.exports = async function(serverID = "") {
  // Game channels
  const guild = await DiscordClient.guilds.fetch(serverID);
  const channels = guild.channels.cache;

  const getChannel = (name = "") => channels.find((channel) => channel.name === name);

  const gameChannels = {
    create: getChannel("create"),
    update: getChannel("update"),
    assets: getChannel("assets")
  }

  // Moonscript segments
  let moonscriptSegments = {
    create: "",
    update: "",
  }

  const fillMoonscriptSegment = async (segmentName = "") => {
    const channel = gameChannels[segmentName];
    
    if (channel) {
      const messages = await channel.messages.fetch();
      const ownerMessages = messages.filter((message) => message.author.id === guild.ownerID);
      const moonMessages = [];
      
      ownerMessages.forEach((message) => {
        moonMessages.push(extractCode("moonscript|moon", message.content) + "\n");
      });
      
      const fullMoon = moonMessages.reverse().join("\n")
      moonscriptSegments[segmentName] = fullMoon;
    }
  }

  const exportEveryClass = (segmentName = "") => {
    const classPattern = /^class/gm
    moonscriptSegments[segmentName] = moonscriptSegments[segmentName].replace(classPattern, "export class");
  }

  const segmentNames = Object.keys(moonscriptSegments);
    
  for (let segmentName of segmentNames) {
    await fillMoonscriptSegment(segmentName);
    exportEveryClass(segmentName)
  }

  // Assets
  let assets = [];
  
  if (gameChannels.assets) {
    const messages = await gameChannels.assets.messages.fetch();
    const ownerMessages = messages.filter((message) => message.author.id === guild.ownerID);
    
    ownerMessages.forEach((message) => {
      // All types...
      const config = yaml.load(extractCode("yaml", message.content));
      const className = config["class name"] || config["class_name"];
      const preview = message.attachments.values().next().value || message.embeds[0];
      const extension = preview.url.split(".").pop();
      const type = extension === "ogg" ? "sound" : "image";
      const url = preview.proxyURL || preview.thumbnail.proxyURL;

      // ... Spritesheets.
      const frameWidth = config["frame width"] || config["frame_width"];
      const frameHeight = config["frame height"] || config["frame_height"];
      const frameRate = config["frame rate"] || config["frame_rate"];
      const { animations = [] } = config;
      
      assets.push({
        name: className,
        url,
        frameWidth,
        frameHeight,
        frameRate,
        animations,
        type,
        extension
      });
    });
    
    assets.reverse();
  }

  return { moonscriptSegments, assets };
}

function extractCode(lang = "txt", content = "") {
  const codeFenceMarkdown = "```";
  const langPrefix = new RegExp(codeFenceMarkdown + "(" + lang + ")", "g");
  const codeSplit = content.split(langPrefix)[2];
  const code = codeSplit.slice(0, -codeFenceMarkdown.length).trim();

  return code;
}