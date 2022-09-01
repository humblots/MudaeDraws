const { EmbedBuilder } = require("discord.js")
const moment = require('moment');
const { Auction } = require('../models');
const { getMember } = require("./discord-getters");


const auctionListEmbed = async (pagination, rows, guild) => {
    const {count, limit, offset} = pagination;
    const embed = new EmbedBuilder();
    embed.setAuthor({
        name: `Liste des enchères de ${guild.name}`,
        iconURL: guild.iconURL()
    })

    for(const auction of rows) {
        const member = await getMember(guild, auction.user_id);
        addAuctionField(embed, auction, member);
    }

    embed.setFooter({ text: `${guild.name} - page ${Math.floor(offset/limit)+1}/${Math.ceil(count/limit)} - total: ${count}`});
    return embed;
}

const userAuctionListEmbed = (pagination, rows, guild, member) => {
    const {count, limit, offset} = pagination;
    const embed = new EmbedBuilder();
    embed.setAuthor({
        name: `Liste des enchères de ${member ? member.displayName : rows[0].user_id}`,
        iconURL: member ? member.user.avatarURL() : null
    })

    for(const auction of rows) {
        addAuctionField(embed, auction, member);
    }
    
    embed.setFooter({ text: `${guild.name} - page ${Math.floor(offset/limit)+1}/${Math.ceil(count/limit)} - total: ${count}`});
    return embed;
}

const addAuctionField = (embed, auction, member) => {
    const startDateTimeStamp = moment(auction.start_date).unix();
    const endDateTimeStamp = moment(auction.end_date).unix();
    
    embed.addFields({
        name: `${auction.getStatusSymbol()} ${auction.status} - ` +
            `${auction.character} - Id: ${auction.id} - Par ${member ? member.displayName : auction.user_id}`,
        value: `**Prix de l'entrée:** ${auction.entry_price || Auction.DEFAULT_PRICE}\n` +
            `**Entrées max par participants:** ${auction.max_user_entries || 'illimité'}\n` +
            `**Entrées max total:** ${auction.max_entries || 'illimité'}\n` +
            `**Date de début:** <t:${startDateTimeStamp}:R>\n` +
            `**Date de fin:** <t:${endDateTimeStamp}:R>`
    });
}

module.exports = {
    auctionListEmbed : auctionListEmbed,
    userAuctionListEmbed : userAuctionListEmbed
};