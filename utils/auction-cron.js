const { Auction, AuctionParticipation, Guild } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('sequelize');
const { getGuild, getChannel } = require('./discord-getters');
const {auctionEmbed, winnerEmbed} = require('./embeds');

const updateStatus = async (client) => {
    const now = new Date();
    const auctions = await Auction.findAll({
        where: {
            start_date : {
                [Op.lte] : now
            },
            end_date : {
                [Op.gt] : now
            },
            status : Auction.PENDING_STATUS
        },
        include: Guild
    });

    for (const auction of auctions) {
        await auction.update({ status : Auction.ONGOING_STATUS });
        const {guild, channel} = await getGuildAndChannelFromAuction(client, auction.Guild);
        if (!guild || !channel) continue;
        
        const embed = await auctionEmbed(auction, guild);
        channel.send({
            content: `${ auction.Guild.role ? '<@&'+ auction.Guild.role +'>' : ''}` +
                ` L'enchère pour **${auction.character}** vient de commencer !`, embeds: [embed]
        });
    }
}

const weightedDraw = (participations, entriesSum) => {
    const weights = {};
    for (const  participation of participations) {
        weights[participation.user_id] = participation.entries / entriesSum;
    }

    let rand = Math.random();
    let winner;
    for (const [id, weight] of Object.entries(weights)) {
        winner = {id, weight}
        if (weight >= rand) return winner;
        rand - weight;
    }

    // not supposed ta happen
    return winner;
}

const pickWinners = async (client) => {
    const auctions = await Auction.findAll({
        where: {
            end_date : {
                [Op.lte] : new Date()
            },
            status : Auction.ONGOING_STATUS
        },
        include: Guild
    });

    for (const auction of auctions) {
        await auction.update({status : Auction.FINISHED_STATUS});

        const {guild, channel} = await getGuildAndChannelFromAuction(client, auction.Guild);
        if (!guild || !channel) continue;

        const message = `${ auction.Guild.role ? '<@&'+ auction.Guild.role +'>' : ''}`+
            ` L'enchère pour **${auction.character}** vient de se terminer !`;

        const participations = await auction.getAuctionParticipations({order: [sequelize.fn('RAND')]});
        if (!participations.length) {
            channel.send(message + "\nMalheureusement, personne n'y a participé...");
            continue;
        }

        const entriesSum = await AuctionParticipation.sum('entries', {where: {auction_id : auction.id}});
        const winner = weightedDraw(participations, entriesSum);
        if (!winner) continue;
        auction.update({winner_id: winner.id})
        const embed = await winnerEmbed(auction, guild, winner.id, winner.weight * entriesSum);
        channel.send({content: message, embeds: [embed]});
    }
}

const getGuildAndChannelFromAuction = async (client, guildModel) => {
    const guild = await getGuild(client, guildModel.id);
    if (!guild) return {guild: null, channel: null};
    const channel = await getChannel(guild, guildModel.channel);
    return {guild, channel};
}

module.exports = {
    updateStatus : updateStatus,
    pickWinners : pickWinners
}