const { SlashCommandBuilder } = require('discord.js');
const { User, Auction, Guild } = require('../../models');
const moment = require('moment');
const { auctionEmbed } = require('../../utils/embeds');
const { getChannel } = require('../../utils/discord-getters');

const urlRegExp = new RegExp(
	/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/,
);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('acreate')
		.setDescription('Creates an auction')
		.setDMPermission(false)
		.addStringOption((option) =>
			option
				.setName('character')
				.setDescription('Character to auction')
				.setMaxLength(255)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('image')
				.setDescription('Character\'s image link')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('start-date')
				.setDescription(
					'Date, Timestamp... (e.g: 24/07/2022 15:30). Now by default',
				),
		)
		.addStringOption((option) =>
			option
				.setName('end-date')
				.setDescription(
					`Date, Timestamp... (e.g:24/07/2022 15:30). ${Auction.DEFAULT_END_AFTER} day(s) after start by default`,
				),
		)
		.addIntegerOption((option) =>
			option
				.setName('entry-price')
				.setDescription(`Entry price, ${Auction.DEFAULT_PRICE} by default`)
				.setMinValue(0),
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
		const { guild, options } = interaction;

		const startDateInput = options.getString('start-date');
		const createdAt = new moment();
		createdAt.seconds(0);
		const startDate = startDateInput ?
			moment(startDateInput, 'DD/MM/YYYY h:mm') :
			createdAt.clone();

		if (!startDate.isValid()) {
			return await interaction.editReply(
				'Le format de la date de début est incorrect',
			);
		}

		if (createdAt.isAfter(startDate)) {
			return await interaction.editReply('La date de début est dépassée');
		}

		const endDateInput = options.getString('end-date');
		const endDate = endDateInput ?
			moment(endDateInput, 'DD/MM/YYYY h:mm') :
			startDate.clone().add(Auction.DEFAULT_END_AFTER, 'days');

		if (!endDate.isValid()) {
			return await interaction.editReply(
				'Le format de la date de fin est incorrect',
			);
		}

		if (startDate.isSameOrAfter(endDate)) {
			return await interaction.editReply(
				'La date de fin doit avoir lieu après celle de début',
			);
		}

		const maxUserEntries = options.getInteger('max-user-entries');
		const maxEntries = options.getInteger('max-entries');
		if (maxEntries && maxEntries < maxUserEntries) {
			return await interaction.editReply(
				'Le nombres maximum d\'entrées doit être supérieur à celui des utilisateurs',
			);
		}

		const img = options.getString('image');
		if (!img.match(urlRegExp)) {
			return await interaction.editReply(
				'Le format de l\'url de l\'image est incorrect',
			);
		}

		const [guildModel] = await Guild.findOrCreate({
			where: { id: guild.id },
		});

		if (!guildModel.channel) {
			return await interaction.editReply(
				'Veuillez définir un channel pour l\'envoi des résultats avant de créer des tirages (/achannel).',
			);
		}

		const channel = await getChannel(guild, guildModel.channel);
		if (!channel) {
			return await interaction.editReply(
				'Veuillez redéfinir un channel pour l\'envoi des résultats avant de créer des tirages, le précédent semble être inexistant (/achannel).',
			);
		}

		const userId = interaction.member.id;
		await User.findOrCreate({
			where: { id: userId },
			defaults: {
				created_at: createdAt.toDate(),
			},
		});

		const character = options.getString('character');
		const price = options.getInteger('entry-price');
		let status;
		if (createdAt.isBefore(startDate)) status = Auction.PENDING_STATUS;
		else status = Auction.ONGOING_STATUS;

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
			status: status,
		});

		const embed = await auctionEmbed(auction, guild);
		channel.send({
			content: `${guildModel.role ? '<@&' + guildModel.role + '>' : ''}` +
				` Un nouveau tirage vient d'être créé pour **${auction.character}** !`,
			embeds: [embed],
		});

		await interaction.editReply('Done.');
	},
};