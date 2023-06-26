const { SlashCommandBuilder } = require('discord.js');
// const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawrefund')
		.setDescription('Permet d\'initier le remboursement d\'un participant')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('draw-id')
				.setDescription('Id du tirage')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('user-id')
				.setDescription('Id du participant')
				.setRequired(true),
		),
	async execute(client, interaction) {
		return await interaction.reply('Temporairement désactivé, mort, dead, pcq j\'ai la flemme de le faire');
		// const { guild, options } = interaction;
		// const userId = options.getStringOption('user-id');
		// const drawId = options.getInteger('draw-id');

		// const [guildModel] = await Guild.find({
		// 	where: { id: guild.id },
		// });

		// await interaction.reply('not ready');
	},
};
