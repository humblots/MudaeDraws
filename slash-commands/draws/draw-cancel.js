const { SlashCommandBuilder } = require('discord.js');
// const { Draw } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawcancel')
		.setDescription('Annule un tirage')
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('draw-id')
				.setDescription('Id du tirage')
				.setRequired(true),
		),
	async execute(client, interaction) {
		return await interaction.reply('Temporairement désactivé, mort, dead, pcq j\'ai la flemme de le faire');
		// await interaction.deferReply();

		// const id = interaction.options.getInteger('draw-id');
		// const member = interaction.member;

		// const draw = await Draw.findByPk(id);
		// if (draw === null) {
		// 	return await interaction.editReply('Tirage introuvable.');
		// }

		// if (
		// 	draw.user_id !== member.id ||
		//     draw.guild_id !== interaction.guildId
		// ) {
		// 	return await interaction.editReply(
		// 		'Tu n\'as pas le droit d\'annuler cette tirage.',
		// 	);
		// }

		// if (draw.status !== Draw.ONGOING_STATUS) {
		// 	return await interaction.editReply(
		// 		'Ce tirage ne peut pas être annulée.',
		// 	);
		// }

		// draw.status = Draw.CANCELLED_STATUS;
		// await draw.save();

		// const participations = await draw.getDrawParticipations();

		// if (participations.length) {
		// 	// TOODO
		// 	return await interaction.editReply('TODO ask for refund');
		// }
		// await interaction.editReply('Tirage annulé.');
	},
};