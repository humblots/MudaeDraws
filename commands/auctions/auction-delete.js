const { SlashCommandBuilder } = require("discord.js");
const { Auction } = require("../../models");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("adelete")
        .setDescription("Delete an auction")
        .setDMPermission(false)
        .addIntegerOption((option) =>
            option
            .setName("auction-id")
            .setDescription("Auction's id")
            .setRequired(true)
        ),
    async execute(client, interaction) {
        await interaction.deferReply();
        const { options, member } = interaction;
        const id = options.getInteger("auction-id");

        const auction = await Auction.findByPk(id);
        if (auction === null) {
            return await interaction.editReply("Tirage introuvable.");
        }

        if (
            auction.user_id !== member.id ||
            auction.guild_id !== interaction.guildId
        ) {
            return await interaction.editReply(
                "Tu n'as pas le droit de supprimer ce tirage."
            );
        }

        if (auction.status !== Auction.PENDING_STATUS) {
            return await interaction.editReply(
                "Ce tirage ne peut pas être supprimé."
            );
        }

        await auction.destroy();
        await interaction.editReply("Tirage supprimé.");
    },
};