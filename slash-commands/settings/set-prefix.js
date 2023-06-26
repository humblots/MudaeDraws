const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');
const { DEFAULT_PREFIX } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prefix')
		.setDescription('Set a server prefix')
		.setDMPermission(false)
		.setDefaultMemberPermissions(0)
		.addStringOption(option =>
			option.setName('input')
				.setDescription('New prefix')
				.setMaxLength(5),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const guildId = interaction.guildId;
		const newPrefix = interaction.options.getString('input');

		const [guild] = await Guild.findOrCreate({
			where: { id: guildId },
		});

		if (newPrefix === null) {
			return await interaction.editReply(
				`**${guild.prefix || DEFAULT_PREFIX}** est le préfixe de ce serveur`,
			);
		}

		if (newPrefix === '' || newPrefix.length > 3) {
			return await interaction.editReply('Préfixe invalide');
		}
		guild.prefix = newPrefix;
		await guild.save();
		await interaction.editReply(`**${newPrefix}** est le nouveau préfixe de ce serveur !`);
	},
};
