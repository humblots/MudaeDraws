const { SlashCommandBuilder } = require('discord.js');
const { User, Auction, Guild } = require('../../models');
const moment = require('moment');
const auctionEmbed  = require('../../utils/auction-embed');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('acreate')
		.setDescription('Creates an auction')
		.setDMPermission(false)
		.addStringOption(option =>
			option.setName('character')
				.setDescription('Character to auction')
				.setMaxLength(255)
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('image')
				.setDescription('Character\'s image link')
				.setRequired(true),
		)
		.addStringOption(option => 
			option.setName('start-date')
				.setDescription('Date, Timestamp... (e.g: 24-07-2022 15:30:00). Now by default'),
		)
		.addStringOption(option =>
			option.setName('end-date')
				.setDescription(
					`Date, Timestamp... (e.g:24-07-2022 15:30:00). ${Auction.DEFAULT_END_AFTER} day(s) after start by default`
				),
		)
		.addIntegerOption(option =>
			option.setName('entry-price')
				.setDescription(`Entry price, ${Auction.DEFAULT_PRICE} by default`)
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
	 * TODO: FIX Date format (current is english date e.g. 08/27/2022)
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const {guild, options} = interaction;

		const startDateInput = options.getString('start-date');
		const createdAt = new moment();
		const startDate = startDateInput ? moment(startDateInput) : createdAt.clone();
		
		if (!startDate.isValid()) {
			return await interaction.editReply(
				"Le format de la date de début est incorrect, création impossible"
			);
		}
		
		if (createdAt.isAfter(startDate)) {
			return await interaction.editReply(
				"La date de début est dépassée, création impossible"
			);
		}

		const endDateInput = options.getString('end-date');
		const endDate = endDateInput 
			? moment(endDateInput)
			: startDate.clone().add(Auction.DEFAULT_END_AFTER, 'days');
	
		if (!endDate.isValid()) {
			return await interaction.editReply(
				"Le format de la date de fin est incorrect, création impossible"
			);
		}
			
		if (startDate.isAfter(endDate)) {
			return await interaction.editReply( 
				"La date de fin doit avoir lieu après celle de début, création impossible"
			);  
		}

		const maxUserEntries = options.getInteger('max-user-entries');
		const maxEntries = options.getInteger('max-entries');
		if (maxEntries < maxUserEntries) {
			return await interaction.editReply(
				"Le nombres maximum d'entrées doit être supérieur à celui des utilisateurs"
			);
		}

		const [guildModel] = await Guild.findOrCreate({
			where: { id: guild.id }
		});

		if (guildModel.channel === null) {
			return await interaction.editReply(
				"Veuillez définir un channel pour l'envoi des résultats avant de créer des enchères (/achannel).")
			;
		}

		const userId = interaction.member.id;
		await User.findOrCreate({
			where: { id: userId},
			defaults: {
				created_at: createdAt.toDate()
			}
		});

		const character = options.getString('character');
		const img = options.getString('image');
		const price = options.getInteger('entry-price');
		let status;
		if (createdAt.isBefore(startDate)) status = Auction.PENDING_STATUS
		else status = Auction.ONGOING_STATUS
		
		const auction = await Auction.create({
			guild_id: guild.id,
			user_id: userId,
			character: character,
			img_url: img,
			entry_price: price,
			max_entries: maxEntries,
			max_user_entries: maxUserEntries,
			start_date: startDate.toDate(),
			end_date: endDate.toDate(),
			created_at: createdAt,
			updated_at: null,
			status: status
		});

		const embed = await auctionEmbed(auction, guild);
		await interaction.editReply({ embeds: [ embed ] });
	},
};
