const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('achannel')
		.setDescription('Set an auction channel')
		.setDMPermission(false)
		.setDefaultMemberPermissions(0)
		.addChannelOption(option =>
			option.setName('channel')
				.setDescription('Auction\'s channel')
				.setRequired(true),
		),
	async execute(client, interaction) {
		const channel = interaction.options.getChannel('channel');

		const [guild] = await Guild.findOrCreate({
			where: { id: interaction.guildId },
		});

		guild.channel = channel.id;

		await guild.save();
		await interaction.reply('Channel défini !');
	},
};
