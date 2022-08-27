const { SlashCommandBuilder } = require('discord.js');
const auctionListEmbed = require('../../utils/auction-list-embed');
const { Auction } = require('../../models');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('alist')
		.setDescription('Display an auctions list')
		.setDMPermission(false)
		.addUserOption(option =>
			option.setName('user')
				.setDescription('User for which to return the list'),
		),
	/**
	 * TODO: Better list display with navigation, more filters
	 */
	async execute(interaction) {
		await interaction.deferReply();
		const options = interaction.options;
		const member = options.getMember('user');
		const guild = interaction.guild;

		const filter = {where: { guild_id: guild.id }, order: [['start_date', 'DESC']]}
		if (member) {
			filter.where.user_id = member.id
		}

		// Manage it with offset / limit
		const {count, rows} = await Auction.findAndCountAll(filter);

		if (rows === null || count === 0) {
			return await interaction.editReply("Aucune enchère retrouvée.");
		}

		const embed = auctionListEmbed(count, rows, guild, member);
		await interaction.editReply({ embeds: [ embed ] });
	},
};
