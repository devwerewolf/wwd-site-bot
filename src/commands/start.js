module.exports = function({ message }) {
    const channelManager = message.guild.channels;
    const roleManager = message.guild.roles;
    
    const roles = roleManager.cache;

    const getRoles = (name = "wwd-editor") => roles.find((role) => role.name === name);

    if (getRoles() === undefined) {
        roleManager.create({
            data: {
                name: 'wwd-editor'
            }
        }).then(async (role) => {
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
            await role.setMentionable(true);
    
            const create = await channelManager.create("create", chanArgs);
            const update = await channelManager.create("update", chanArgs);
            const assets = await channelManager.create("assets", chanArgs);

            console.log(create, update, assets);
    
            await message.member.roles.add(role.id);
            message.channel.send(`The channels <#${create.id}>, <#${update.id}> and <#${assets.id}> has been created. For add peoples to your project, add the role <@&${role.id}> to them.`)
        });
    } else {
        return `The bot have already created the text channels and the role. For redo a setup, please, delete the role <@&${getRoles().id}>`
    }
  }
}
