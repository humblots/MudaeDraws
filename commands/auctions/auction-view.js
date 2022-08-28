const { SlashCommandBuilder } = require('discord.js');
const { Auction } = require('../../models');
const auctionEmbed = require('../../utils/auction-embed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aview')
		.setDescription('View an auction')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		),
	/**
	 * TODO: Add a way to vizualise participations
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const auctionId = interaction.options.getInteger('id');
		const guildId = interaction.guildId;

		const auction = await Auction.findOne({where: {id: auctionId, guild_id: guildId}});

		if (auction === null) {
			return await interaction.editReply("Enchère introuvable");
		}

		// To complete with participants visualization
		const auctionMember = await interaction.guild.members.fetch(auction.user_id);
		const embed = auctionEmbed(auction, auctionMember);
		await interaction.editReply({ embeds: [ embed ] });
	},
};
