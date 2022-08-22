const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aupdate')
		.setDescription('Update an auction')
		.addStringOption(option =>
			option.setName('character')
				.setDescription('Character to auction')
				.setMaxLength(50),
		)
		.addStringOption(option =>
			option.setName('image')
				.setDescription('Character\'s image link'),
		)
		.setDMPermission(false),
	async execute(interaction) {
		await interaction.reply('Incomming auction update...');
	},
};
