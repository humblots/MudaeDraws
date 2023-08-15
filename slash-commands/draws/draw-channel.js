const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawchannel')
		.setDescription('Permet de choisir un channel pour les annonces des tirages')
		.setDMPermission(false)
		.setDefaultMemberPermissions(0)
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Channel pour les annonces')
				.setRequired(true),
		),
	async execute(client, interaction) {
		const channel = interaction.options.getChannel('channel');

		const [guild] = await Guild.findOrCreate({
			where: { id: interaction.guildId },
		});

		guild.channel = channel.id;

		await guild.save();
		await interaction.reply({ content: 'Channel défini !', ephemeral: true });
	},
};
