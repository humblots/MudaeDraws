const { EmbedBuilder } = require('discord.js');
const { Auction } = require('../models');
const moment = require('moment');

const auctionEmbed = (auction, member) => {

    const startDateTimeStamp = moment(auction.start_date).unix();
    const endDateTimeStamp = moment(auction.end_date).unix();

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
    .setFooter({ text: `Par ${member.displayName} - id: ${auction.id} - ${auction.status}`, iconURL: member.avatarURL() });
    
    return embed;
}
        
module.exports = auctionEmbed