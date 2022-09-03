const { EmbedBuilder } = require('discord.js');
const { Auction } = require('../models');
const moment = require('moment');
const { getMember } = require('./discord-getters');

const auctionEmbed = async (auction, guild, pagination = null) => {
    const startDateTimeStamp = moment(auction.start_date).unix();
    const endDateTimeStamp = moment(auction.end_date).unix();
    const member = await getMember(guild, auction.user_id);
    const paginationTrace = pagination ? ` - ${pagination.index + 1}/${pagination.count}` : '';

    const embed = new EmbedBuilder()
    .setColor(auction.getEmbedColor())
    .setTitle("Enchère pour " + auction.character)
    .setDescription(
        `**Prix de l'entrée:** ${auction.entry_price || Auction.DEFAULT_PRICE}\n` +
        `**Entrées max par participants:** ${auction.max_user_entries || 'illimité'}\n` +
        `**Entrées max total:** ${auction.max_entries || 'illimité'}`
    )
    .addFields(
        { name: "Date de début", value: `<t:${startDateTimeStamp}:R> (<t:${startDateTimeStamp}>)`},
        { name: 'Date de fin', value: `<t:${endDateTimeStamp}:R> (<t:${endDateTimeStamp}>)`},
    )
    .setImage(auction.img_url)
    .setFooter({ 
        text: `Par ${member ? member.displayName : auction.user_id}\n`+
            `id: ${auction.id} - ${auction.status}` + paginationTrace, 
        iconURL: member ? member.user.avatarURL() : null
    });

    
    return embed;
}

const auctionListEmbed = async (pagination, rows, guild) => {
    const {count, limit, offset} = pagination;
    const embed = new EmbedBuilder();
    embed.setAuthor({
        name: `Liste des enchères de ${guild.name}`,
        iconURL: guild.iconURL()
    })

    for(const auction of rows) {
        const member = await getMember(guild, auction.user_id);
        _addAuctionField(embed, auction, member);
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
        _addAuctionField(embed, auction, member);
    }
    
    embed.setFooter({ text: `${guild.name} - page ${Math.floor(offset/limit)+1}/${Math.ceil(count/limit)} - total: ${count}`});
    return embed;
}

const _addAuctionField = (embed, auction, member) => {
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

const participationsEmbed = async (auction, participations, guild) => {
    const auctionMember = await getMember(guild, auction.user_id);
    const embed = new EmbedBuilder()
    .setColor(auction.getEmbedColor())
    .setTitle("Participations pour l'enchère de " + auction.character)
    .setFooter({ 
        text: `Par ${auctionMember ? auctionMember.displayName : auction.user_id}\n`+
            `id: ${auction.id} - ${auction.status}`, 
        iconURL: auctionMember ? auctionMember.user.avatarURL() : null
    });

    if (!participations.length) {
        embed.setDescription(`Aucune participation.`);
        return embed;
    }

    let sum = 0;
    for (const participation of participations) {
        const member = await getMember(guild, participation.user_id);
        sum += participation.entries;
        embed.addFields(
            {
                name: member ? member.displayName : participation.user_id,
                value: `Nombre d'entrées: ${participation.entries}/${auction.max_user_entries || auction.max_entries || '∞'}\n` +
                    `Total dépensé: ${participation.entries * (auction.entry_price || Auction.DEFAULT_PRICE)}`
            }
        );
    }

    if (auction.max_entries) {
        embed.setDescription(`**Nombre d'entrées restantes: ${auction.max_entries - sum}**`);
    } else {
        embed.setDescription(`**Nombre d'entrées restantes: ∞**`);
    }

    return embed;
}


const winnerEmbed = () => {
    new EmbedBuilder();
}

module.exports = {
    auctionEmbed,
    auctionListEmbed,
    userAuctionListEmbed,
    participationsEmbed,
    winnerEmbed
}