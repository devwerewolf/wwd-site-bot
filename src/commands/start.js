module.exports = function({ message }) {
  const channelManager = message.guild.channels;
  
  channelManager.create("create");
  channelManager.create("update");
  channelManager.create("assets");
}