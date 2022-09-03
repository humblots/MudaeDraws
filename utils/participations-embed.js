const { EmbedBuilder } = require('discord.js');
const { Auction } = require('../models');
const { getMember } = require('./discord-getters');

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

module.exports = participationsEmbed;