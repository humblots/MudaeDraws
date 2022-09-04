const { SlashCommandBuilder } = require('discord.js');
const { Guild } = require('../../models');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('arefund')
		.setDescription('Refund an auction participants')
		.setDMPermission(false)
		.addIntegerOption(option =>
			option.setName('auction-id')
				.setDescription("Auction's id")
				.setRequired(true)
		)
        .addStringOption(option => 
            option.setName('user-id')
                .setDescription("User's id")
                .setRequired(true)
        ),
	async execute(client, interaction) {
        const {guild, options} = interaction;
        const userId = options.getStringOption('user-id');
        const auctionId = options.getInteger('auction-id');
        
        const [guildModel] = await Guild.find({
			where: { id: guild.id }
		});

        await interaction.reply("not ready");
	},
};
