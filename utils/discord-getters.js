module.exports = {
    getChannel : async (guild, id) => {
        let channel = guild.channels.cache.get(id);
        if (channel === null) {
            channel = await guild.channels.fetch(id);
        }
        return channel;
    },
    getMember : async (guild, id) => {
        let member = guild.members.cache.get(id);
        if (member === null) {
            member = await guild.members.fetch(id);
        }
        return member;
    },
    getGuild : async (client, id) => {
        let guild = client.guilds.cache.get(id);
        if (guild === null) {
            guild = await client.guilds.fetch(id);
        }
        return guild;
    }
}