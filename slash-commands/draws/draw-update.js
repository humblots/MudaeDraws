const { SlashCommandBuilder } = require('discord.js');
const { Draw, Guild } = require('../../models');
const { drawEmbed } = require('../../utils/embeds');
const { getChannel } = require('../../utils/discord-getters');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drawupdate')
		.setDescription('Permet de modifier un tirage.')
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('draw-id')
				.setDescription('Id du tirage')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName('image').setDescription('Image du personnage'),
		)
		.addStringOption((option) =>
			option
				.setName('start-date')
				.setDescription('Date, Timestamp... (e.g: 24/07/2022 15:30)'),
		)
		.addStringOption((option) =>
			option
				.setName('end-date')
				.setDescription('Date, Timestamp... (e.g: 24/07/2022 15:30)'),
		)
		.addIntegerOption((option) =>
			option.setName('entry-price')
				.setDescription('Prix d\'entrée')
				.setMinValue(1),
		)
		.addIntegerOption((option) =>
			option
				.setName('max-user-entries')
				.setDescription(
					'Nombre maximum d\'entrées par utilisateur, illimité par défaut',
				)
				.setMinValue(1),
		)
		.addIntegerOption((option) =>
			option
				.setName('max-entries')
				.setDescription(
					'Nombre maximum d\'entrées, illimité par défaut',
				)
				.setMinValue(1),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { options, guild, member } = interaction;

		const id = options.getInteger('draw-id');
		const draw = await Draw.findOne({ where: { id, guild_id: guild.id }, include: Guild });
		if (draw === null) {
			return await interaction.editReply('Tirage introuvable.');
		}

		if (
			draw.user_id !== member.id ||
			draw.guild_id !== guild.id
		) {
			return await interaction.editReply(
				'Tu n\'as pas le droit d\'éditer ce tirage.',
			);
		}

		const endDateInput = options.getString('end-date'),
			startDateInput = options.getString('start-date'),
			img = options.getString('image'),
			price = options.getInteger('entry-price'),
			maxEntries = options.getInteger('max-entries'),
			maxUserEntries = options.getInteger('max-user-entries');

		if (draw.status !== Draw.PENDING_STATUS) {
			if (endDateInput || startDateInput || price !== null || maxEntries || maxUserEntries) {
				return await interaction.editReply(
					'Seule l\'image de ce tirage peut-être modifiée.',
				);
			}
			if (img) {
				draw.img_url = img;
			}
		}
		else {
			// End Date handling
			if (endDateInput) {
				const endDate = moment(endDateInput, 'DD/MM/YYYY h:mm');
				if (!endDate.isValid()) {
					return await interaction.editReply(
						'La nouvelle date de fin est invalide.',
					);
				}
				if (endDate.isBefore(moment())) {
					return await interaction.editReply(
						'La nouvelle date de fin ne peut pas être dans le passé.',
					);
				}
				draw.end_date = endDate.toDate();
			}

			// Start Date handling
			if (startDateInput) {
				const startDate = moment(startDateInput, 'DD/MM/YYYY h:mm');
				if (!startDate.isValid()) {
					return await interaction.editReply(
						'La nouvelle date de début est invalide.',
					);
				}
				if (startDate.isBefore(moment())) {
					return await interaction.editReply(
						'La nouvelle date de début ne peut pas être dans le passé.',
					);
				}
				if (startDate.isSameOrAfter(moment(draw.end_date))) {
					return await interaction.editReply(
						'La nouvelle date de début ne peut pas avoir lieu après la date de fin.',
					);
				}
				draw.start_date = startDate.toDate();
			}

			if (img) {
				draw.img_url = img;
			}
			if (price !== null) {
				draw.entry_price = price;
			}

			if (maxEntries && maxEntries < maxUserEntries) {
				return await interaction.editReply(
					'Le nombre maximal d\'entrées par utilisateur doit être inférieur aux nombre maximal d\'entrées total du tirage.',
				);
			}

			draw.max_entries = maxEntries;
			draw.max_user_entries = maxUserEntries;
		}

		if (draw.changed()) {
			await draw.save();
			const embed = await drawEmbed(draw, guild);
			const message = {
				content: `${draw.Guild.role ? '<@&' + draw.Guild.role + '> ' : ''}` +
					`Le tirage pour ${draw.character} a été mis à jour !`,
				embeds: [embed],
			};
			if (draw.Guild.channel !== null) {
				const channel = await getChannel(guild, draw.Guild.channel);
				channel.send(message);
				return await interaction.editReply('Done.');
			}
			else {
				return await interaction.editReply(message);
			}
		}
		else {
			return await interaction.editReply('Aucun changement.');
		}
	},
};