const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawrole')
		.setDescription('Permet de choisir un rôle pour les mentions')
		.setDMPermission(false)
		.setDefaultMemberPermissions(0)
		.addRoleOption(option =>
			option.setName('role')
				.setDescription('Rôle à mentionner')
				.setRequired(true),
		),
	async execute(client, interaction) {
		const role = interaction.options.getRole('role');

		const [guild] = await Guild.findOrCreate({
			where: { id: interaction.guildId },
		});

		guild.role = role.id;
		await guild.save();
		await interaction.reply('Role défini !');
	},
};
