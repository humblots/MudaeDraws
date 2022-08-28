const { EmbedBuilder } = require("discord.js")
const moment = require('moment');
const { Auction } = require('../models');


const auctionListEmbed = async (count, rows, guild, member = null) => {
    const embed = new EmbedBuilder();

    embed.setAuthor({
        name: `Liste des enchères ${member ? 'de ' + member.displayName : ''}`,
        iconURL: member ? member.avatarURL() : guild.iconURL()}
    )

    for(const auction of rows) {
        const startDateTimeStamp = moment(auction.start_date).unix();
        const endDateTimeStamp = moment(auction.end_date).unix();
        auctionMember = await guild.members.fetch(auction.user_id);
        
        embed.addFields({
            name: `${auction.getStatusSymbol()} ${auction.status} - ` +
                `${auction.character} - Id: ${auction.id} - Par ${auctionMember.displayName}`,
            value: `**Prix de l'entrée:** ${auction.entry_price || Auction.DEFAULT_PRICE}\n` +
                `**Entrées max par participants:** ${auction.max_user_entries || 'illimité'}\n` +
                `**Entrées max total:** ${auction.max_entries || 'illimité'}\n` +
                `**Date de début:** <t:${startDateTimeStamp}:R>\n` +
                `**Date de fin:** <t:${endDateTimeStamp}:R>`
        });
    }

    embed.setFooter({ text: `${guild.name} - total: ${count}`});

    return embed;
}

module.exports = auctionListEmbed;