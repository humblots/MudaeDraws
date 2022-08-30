const { SlashCommandBuilder } = require('discord.js');
const { Auction } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('adelete')
		.setDescription('Delete an auction')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const options = interaction.options;
		const member = interaction.member;

		const id = options.getInteger('id');
		const auction = await Auction.findByPk(id);
		if (auction === null) {
			return await interaction.editReply('Enchère introuvable.');
		}

		if (auction.user_id !== member.id || auction.guild_id !== interaction.guildId) {
			return await interaction.editReply('Vous n\'avez pas le droit de supprimer cette enchère.');
		}

		if (auction.status !== Auction.PENDING_STATUS) {
			return await interaction.editReply('Cette enchère ne peut pas être supprimée.');
		}

		await auction.destroy();
		await interaction.editReply('Enchère supprimée.');
	},
};
