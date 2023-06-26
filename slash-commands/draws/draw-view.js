const {
	SlashCommandBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const { Draw, DrawParticipation } = require('../../models');
const {
	drawEmbed,
	participationsEmbed,
	winnerEmbed,
} = require('../../utils/embeds');

const buttonsRow = (label) => {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('draw-participations')
			.setStyle(ButtonStyle.Secondary)
			.setLabel(label)
			.setEmoji('🔄'),
	);
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawview')
		.setDescription('Affiche un tirage')
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('draw-id')
				.setDescription('ID du tirage')
				.setRequired(true),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { guild, options } = interaction;
		const id = options.getInteger('draw-id');
		let showParticipations = false;

		const draw = await Draw.findOne({
			where: { id, guild_id: guild.id },
		});
		if (draw === null) {
			return await interaction.editReply('Tirage introuvable');
		}

		const participations = await draw.getDrawParticipations();
		const entriesSum = await DrawParticipation.sum('entries', { where: { draw_id: id } });

		let embed;
		if (draw.winner_id) {
			const participation = await DrawParticipation.findOne({
				where: { draw_id: draw.id, user_id: draw.winner_id },
			});
			embed = await winnerEmbed(draw, guild, draw.winner_id, participation.entries);
		}
		else {
			embed = await drawEmbed(draw, guild);
		}

		const pEmbed = await participationsEmbed(draw, guild, participations, entriesSum);

		await interaction.editReply({
			embeds: [embed],
			components: [buttonsRow('Voir les participations')],
		});

		const filter = (i) => (i.customId === 'draw-participations');
		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			time: 60 * 1000,
		});
		collector.on('collect', async (i) => {
			try {
				showParticipations = !showParticipations;
				return await i.update({
					embeds: [showParticipations ? pEmbed : embed],
					components: [buttonsRow('Voir les participations')],
				});
			}
			catch (e) {
				console.log(e);
			}
		});

		collector.on('end', async () => {
			await interaction.editReply({ components: [] });
		});
	},
};