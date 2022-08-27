const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { User, Auction } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('acreate')
		.setDescription('Create an auction')
		.setDMPermission(false)
		.addStringOption(option =>
			option.setName('character')
				.setDescription('Character to auction')
				.setMaxLength(50)
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('image')
				.setDescription('Character\'s image link')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('price')
				.setDescription('Entry price')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('max-user-entries')
				.setDescription('Max number of entries that a user can purchase'),
		)
		.addIntegerOption(option =>
			option.setName('max-entries')
				.setDescription('Max number of entries for the auction'),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const options = interaction.options;
		const character = options.getString('character');
		const img = options.getString('image');
		const price = options.getInteger('price');
		const maxUserEntries = options.getInteger('max-user-entries');
		const maxEntries = options.getInteger('max-entries');
		const userId = interaction.member.id;

		const startDate = new Date();
		const startDateTimeStamp = startDate.getTime();
		const endDate = new Date(startDate);
		endDate.setDate(startDate.getDate() + 1);
		const endDateTimeStamp = endDate.getTime();

		const dbUser = await User.findByPk(userId);
		if (dbUser === null) {
			await User.create({id: userId});
		}

		await Auction.create({
			guild_id: interaction.guildId,
			user_id: userId,
			character: character,
			img_url: img,
			entry_price: price,
			max_entries: maxEntries,
			max_user_entries: maxUserEntries,
			start_date: startDate,
			end_date: endDate,
			created_at: new Date(),
			updated_at: null,
			status: 'temp'
		});

		const user = interaction.client.users.cache.get(userId);

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle("Enchère pour " + character)
			.setDescription(
				`Prix d'entrée: ${price}\n` +
				`Entrées max par participants: ${maxUserEntries}\n` +
				`Entrées max total: ${maxEntries}`
			)
			.addFields(
				{ name: "Date de début", value: `<t:${startDateTimeStamp}:R><t:${startDateTimeStamp}>`},
				{ name: 'Date de fin', value: `<t:${endDateTimeStamp}:R><t:${endDateTimeStamp}>`},
			)
			.setImage(img)
			.setFooter({ text: user.username, iconURL: user.avatarURL() });

		await interaction.editReply({ embeds: [ embed ] });
	},
};
