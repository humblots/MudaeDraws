const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Auction, AuctionParticipation } = require('../../models');
const {auctionEmbed, participationsEmbed, winnerEmbed} = require('../../utils/embeds');

const buttonsRow = (label) => {
	return new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId('auction-participations')
				.setStyle(ButtonStyle.Secondary)
				.setLabel(label)
				.setEmoji('🔄')
		);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aview')
		.setDescription('View an auction')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('auction-id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();
		const {guild, options} = interaction;
		const auctionId = options.getInteger('auction-id');
		let showParticipations = false;

		const auction = await Auction.findOne({where: {id: auctionId, guild_id: guild.id}});

		if (auction === null) {
			return await interaction.editReply("Enchère introuvable");
		}

		const participations = await auction.getAuctionParticipations();
		const entriesSum = await AuctionParticipation.sum('entries', {where: {auction_id: auction.id}});
		
		let embed;
		if (auction.winner_id) {
			const participation = await AuctionParticipation.findOne({where: {auction_id: auction.id, user_id: auction.winner_id}})
			embed = await winnerEmbed(auction, guild, auction.winner_id, participation.entries);
		}
		else embed = await auctionEmbed(auction, guild);
		
		const message = { embeds: [ embed ], components: [buttonsRow('Voir les participations')] };
		await interaction.editReply(message);
		
		const pEmbed = await participationsEmbed(auction, guild, participations, entriesSum);
	
		const filter = i => i.customId === "auction-participations";
		const collector = interaction.channel.createMessageComponentCollector({filter, time: 60 * 1000});
		collector.on('collect', async i => {
			showParticipations = !showParticipations;
			if (showParticipations) {
				return await i.update({embeds: [pEmbed], components: [buttonsRow("Voir l'enchère")]});
			}
			return await i.update(message);
		});

		collector.on('end', () => {
			interaction.editReply({ components: []});
		})
	},
};
