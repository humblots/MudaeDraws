const { SlashCommandBuilder } = require('discord.js');
const { Auction, Guild } = require('../../models');
const { auctionEmbed } = require('../../utils/embeds');
const { getChannel } = require('../../utils/discord-getters');
const moment = require('moment');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aupdate')
		.setDescription('Update an auction')
		.setDMPermission(false)
		.addIntegerOption((option) =>
			option
				.setName('auction-id')
				.setDescription('Auction\'s id')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option.setName('image').setDescription('Character\'s image link'),
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
			option.setName('entry-price').setDescription('Entry price').setMinValue(1),
		)
		.addIntegerOption((option) =>
			option
				.setName('max-user-entries')
				.setDescription(
					'Max number of entries that a user can purchase, unlimited by default',
				)
				.setMinValue(1),
		)
		.addIntegerOption((option) =>
			option
				.setName('max-entries')
				.setDescription(
					'Max number of entries for the auction, unlimited by default',
				)
				.setMinValue(1),
		),
	async execute(client, interaction) {
		await interaction.deferReply();
		const { options, guild, member } = interaction;

		const id = options.getInteger('auction-id');
		const auction = await Auction.findByPk(id, { include: Guild });
		if (auction === null) {
			return await interaction.editReply('Tirage introuvable.');
		}

		if (
			auction.user_id !== member.id ||
            auction.guild_id !== interaction.guildId
		) {
			return await interaction.editReply(
				'Tu n\'as pas le droit d\'éditer ce tirage.',
			);
		}

		const endDateInput = options.getString('end-date'),
			startDateInput = options.getString('start-date'),
			img = options.get('image'),
			price = options.getInteger('entry-price'),
			maxEntries = options.getInteger('max-entries'),
			maxUserEntries = options.getInteger('max-user-entries');

		if (auction.status !== Auction.PENDING_STATUS) {
			if (endDateInput || startDateInput || price !== null || maxEntries || maxUserEntries) {
				return await interaction.editReply(
					'Seule l\'image de ce tirage peut-être modifiée.',
				);
			}
			auction.img_url = img;
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
				auction.end_date = endDate.toDate();
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
				if (startDate.isSameOrAfter(moment(auction.end_date))) {
					return await interaction.editReply(
						'La nouvelle date de début ne peut pas avoir lieu après la date de fin.',
					);
				}
				auction.start_date = startDate.toDate();
			}

			if (img) {
				auction.img_url = img;
			}
			if (price !== null) {
				auction.entry_price = price;
			}

			auction.max_entries = maxEntries;

			if (maxUserEntries === null) {
				auction.max_user_entries = null;
			}
			else if (auction.max_entries === null) {
				auction.max_user_entries = maxUserEntries;
			}
			else if (maxUserEntries > auction.max_entries) {
				return await interaction.editReply(
					'Le nombre maximal d\'entrées par utilisateur doit être inférieur aux nombre maximal d\'entrées total du tirage.',
				);
			}
		}

		if (auction.changed()) {
			await auction.save();
			const embed = await auctionEmbed(auction, guild);
			if (auction.Guild.channel !== null) {
				const channel = await getChannel(guild, auction.Guild.channel);
				channel.send({
					content: `${auction.Guild.role ? '<@&' + auction.Guild.role + '> ' : ''}` +
						`Le tirage pour ${auction.character} a été mis à jour !`,
					embeds: [embed] });
				await interaction.editReply('Done.');
			}
			else {
				await interaction.editReply({ embeds: [embed] });
			}
		}
		else {
			await interaction.editReply('Aucun changement.');
		}
	},
};