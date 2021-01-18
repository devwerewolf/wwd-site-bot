const { encodeToString } = require("../utils/recode-ID");

module.exports = function({ message }) {
  const serverID = BigInt(message.guild.id);
  const encodedServerID = encodeToString(serverID);
  const werewolfURL = `https://werewolf.dev/${encodedServerID}`;
  return werewolfURL;
}