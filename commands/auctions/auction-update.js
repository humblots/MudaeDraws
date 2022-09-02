const { SlashCommandBuilder } = require('discord.js');
const { Auction } = require('../../models');
const auctionEmbed = require('../../utils/auction-embed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aupdate')
		.setDescription('Update an auction')
		.setDMPermission(false)
		.addIntegerOption(option => 
			option.setName('id')
				.setDescription("Auction's id")
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('image')
				.setDescription('Character\'s image link'),
		)
		.addStringOption(option => 
			option.setName('start-date')	
				.setDescription('Date, Timestamp... (e.g: 24-07-2022 15:30:00)')
		)
		.addStringOption(option => 
			option.setName('end-date')
				.setDescription('Date, Timestamp... (e.g: 24-07-2022 15:30:00)')
		)
		.addIntegerOption(option =>
			option.setName('entry-price')
				.setDescription(`Entry price`)
				.setMinValue(1),
		)
		.addIntegerOption(option =>
			option.setName('max-user-entries')
				.setDescription('Max number of entries that a user can purchase, unlimited by default')
				.setMinValue(1),
		)
		.addIntegerOption(option =>
			option.setName('max-entries')
				.setDescription('Max number of entries for the auction, unlimited by default')
				.setMinValue(1),
		),
	/**
	 * TODO: FIX Date format (current is english date e.g. 08/27/2022) and make entries update
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const {options, guild, member} = interaction;

		const id = options.getInteger('id');
		const auction = await Auction.findByPk(id);
		if (auction === null) {
			return await interaction.editReply('Enchère introuvable.');
		}

		if (auction.user_id !== member.id || auction.guild_id !== interaction.guildId ) {
			return await interaction.editReply("Vous n'avez pas le droit d'éditer cette enchère.");
		}

		if (auction.status === Auction.CANCELLED_STATUS || auction.status === Auction.FINISHED_STATUS) {
			return await interaction.editReply("Cette enchère ne peut plus être éditée.");
		}

		// End Date handling
		const endDateInput = options.getString('end-date');
		if (endDateInput) {
			const endDate = moment(endDateInput);
			if ( !endDate.isValid() ) {
				return await interaction.editReply("La nouvelle date de fin est invalide.");
			}
			if (startDate.isBefore(moment())) {
				return await interaction.editReply("La nouvelle date de fin ne peut pas être dans le passé.");
			}
			auction.end_date = endDate.toDate();
		}

		// Start Date handling
		const startDateInput = options.getString('start-date');
		if (auction.status === Auction.PENDING_STATUS && startDateInput) {
			const startDate = moment(startDateInput);
			if ( !startDate.isValid() ) {
				return await interaction.editReply("La nouvelle date de début est invalide.");
			}
			if (startDate.isBefore(moment())) {
				return await interaction.editReply("La nouvelle date de début ne peut pas être dans le passé.");
			}
			if (startDate.isAfter(moment(auction.end_date))) {
				return await interaction.editReply(
					"La nouvelle date de début ne peut pas avoir lieu après la date de fin."
				);
			}
			auction.start_date = startDate.toDate();
		}

		const img = options.getString('image');
		if (img) {
			auction.img_url = img;
		}
		const price = options.getInteger('entry-price');
		if (price) {
			auction.entry_price = price;
		}

		// TODO: manage entries from what's already in db if auctions has participants
		const maxUserEntries = options.getInteger('max-user-entries');
		const maxEntries = options.getInteger('max-entries');

		await auction.save();

		const embed = await auctionEmbed(auction, guild);
		await interaction.editReply({ embeds: [ embed ] });
	},
};
