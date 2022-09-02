const { Auction, Guild } = require('../models');
const { Op } = require('sequelize');
const { getGuild, getMember, getChannel } = require('./discord-getters');
const auctionEmbed = require('./auction-embed');

const updateStatus = async (client) => {
    const auctions = await Auction.findAll({
        where: {
            start_date : {
                [Op.lte] : new Date()
            },
            end_date : {
                [Op.gt] : new Date()
            },
            status : Auction.PENDING_STATUS
        }
    });

    for (const auction of auctions) {
        await auction.update({ status : Auction.ONGOING_STATUS });
        await sendNotification(client, auction, `L'enchère pour ${auction.character} vient de commmencer !`);
    }
}

const pickWinners = async (client) => {
    const auctions = await Auction.findAll({
        where: {
            end_date : {
                [Op.lte] : new Date()
            },
            status : Auction.ONGOING_STATUS
        }
    });

    for (const auction of auctions) {
        await auction.update({status : Auction.FINISHED_STATUS});
        await sendNotification(client, auction, `L'enchère pour ${auction.character} vient de se terminer !`);
    }
}

const sendNotification = async (client, auction, message, type) => {
    const guildId = auction.guild_id;
    const guildModel = await auction.getGuild();

    const guild = await getGuild(client, guildId);
    if (guild === null) return;

    const channel = await getChannel(guild, guildModel.channel);
    if (channel === null) returns;

    const embed = await auctionEmbed(auction, guild)
    channel.send({content: message, embeds: [embed]});
}

module.exports = {
    updateStatus : updateStatus,
    pickWinners : pickWinners
}