const {MessageMentions: { USERS_PATTERN }} = require('discord.js');

module.exports = {
    getChannel : async (guild, id) => {
        let channel = guild.channels.cache.get(id);
        if (channel === undefined) {
            channel = await guild.channels.fetch(id);
        }
        return channel;
    },
    getMember : async (guild, id) => {
        let member = guild.members.cache.get(id);
        if (member === undefined) {
            member = await guild.members.fetch(id);
        }
        return member;
    },
    getGuild : async (client, id) => {
        let guild = client.guilds.cache.get(id);
        if (guild === undefined) {
            guild = await client.guilds.fetch(id);
        }
        return guild;
    },
    getUserMentionsFromMessage : (message) => {
        if (!mention) return;
    
        const matches = mention.matchAll(USERS_PATTERN)
        if (!matches) return;

        const users = [];
        for (const id of matches) {
            users.push(message.guild.members.cache.get(id))
        }
        return users;
    }
}