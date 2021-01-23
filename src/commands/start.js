module.exports = function({ message }) {
    const channelManager = message.guild.channels;
    const roleManager = message.guild.roles;
    
    roleManager.create({
        data: {
            name: 'wwd-editor'
        }
    }).then((role) => {
        const chanArgs = {
            permissionOverwrites : [
                {
                    id: role.id,
                    allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                },
                {
                    id: message.guild.roles.everyone.id,
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                }
            ]
        };

        channelManager.create("create", chanArgs);
        channelManager.create("update", chanArgs);
        channelManager.create("assets", chanArgs);

        message.member.roles.add(role.id)
    
    });
  }