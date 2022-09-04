const { SlashCommandBuilder } = require('discord.js');
const { Auction } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('acancel')
		.setDescription('Cancels an auction')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('auction-id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		),
	async execute(client, interaction) {
		await interaction.deferReply();

		const id = interaction.options.getInteger('auction-id');
		const member = interaction.member;

		const auction = await Auction.findByPk(id);
		if (auction === null) {
			return await interaction.editReply('Enchère introuvable.');
		}

		if (auction.user_id !== member.id || auction.guild_id !== interaction.guildId) {
			return await interaction.editReply('Vous n\'avez pas le droit d\'annuler cette enchère.');
		}

		if (auction.status !== Auction.ONGOING_STATUS) {
			return await interaction.editReply('Cette enchère ne peut pas être annulée.');
		}

		auction.status = Auction.CANCELLED_STATUS;
		await auction.save();

		const participations = await auction.getAuctionParticipations();

		if (participations.length) {
			// TOODO
			return await interaction.editReply('TODO ask for refund');
		}
		await interaction.editReply('Enchère annulée.');
	},
};
