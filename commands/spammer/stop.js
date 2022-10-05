const spammer = require("../../utils/spammer");

module.exports = {
    name : "stop",
    description : "Stop le spammer lol",
    args : false,
    guildOnly : true,
    async execute(message, args, client) {
        const channel = await message.guild.channels.fetch("1022213567207977071");
        spammer.stop(channel);
    }
}