const { SlashCommandBuilder } = require("discord.js");
const { Auction, AuctionParticipation, User } = require("../../models");
const moment = require("moment");

const exitWord = "exit";

const buyingProcess = async(channel, member, auction, amount) => {
    try {
        await awaitGivek(channel, member, auction, amount);
        await awaitValidation(channel, member, auction, amount);
    } catch (e) {
        throw e;
    }
};

const awaitGivek = async(channel, member, auction, amount) => {
    const command = "$givek";
    const filter = (m) =>
        (m.content.toLowerCase().startsWith(command) ||
            m.content.toLowerCase() === exitWord) &&
        m.author.id === member.id;

    const collector = channel.createMessageCollector({ filter, time: 20 * 1000 });
    return new Promise((resolve, reject) => {
        collector.on("collect", (m) => {
            collector.resetTimer({ time: 20 * 1000 });
            let args = m.content.substring(command.length).trim().split(/\s+/);

            if (m.content.toLowerCase() === exitWord) {
                return collector.stop("end");
            }

            if (args[0] !== auction.user_id) {
                m.react("❌");
                return channel.send("Vérifiez l'id");
            }

            if (+args[1] !== amount) {
                m.react("❌");
                return channel.send("Vérifiez le montant");
            }

            m.react("✅");
            resolve(+args[1]);
            collector.stop("valid");
        });

        collector.on("end", (collected, reason) => {
            if (reason === "time") reject("Temps écoulé");
            if (reason === "end") reject("Opération annulée");
        });
    });
};

const awaitValidation = async(channel, member, auction, amount) => {
    const okChoices = ["oui", "yes", "o", "y"];
    const cancelChoices = ["no", "n"];
    const filter = (m) =>
        okChoices.concat(cancelChoices).includes(m.content.toLowerCase()) ||
        (m.content.toLowerCase() === exitWord && m.author.id === member.id);

    const collector = channel.createMessageCollector({ filter, time: 15 * 1000 });
    return new Promise((resolve, reject) => {
        collector.on("collect", (m) => {
            const choice = m.content.trim().toLowerCase();
            if (okChoices.includes(choice)) {
                return collector.stop("confirmed");
            }
            if (cancelChoices.includes(choice) || choice === exitWord) {
                return collector.stop("end");
            }
        });

        collector.on("end", (collected, reason) => {
            if (reason == "confirmed") {
                const filter = (m) => m.author.id === "432610292342587392";
                const mudaeCollector = channel.createMessageCollector({
                    filter,
                    time: 5 * 1000,
                });
                mudaeCollector.on("collect", (m) => {
                    if (
                        m.content.includes(member.id) &&
                        m.content.includes(amount) &&
                        m.content.includes(":kakera:469835869059153940") &&
                        m.content.includes(auction.user_id)
                    ) {
                        resolve(true);
                        return mudaeCollector.stop("confirmed");
                    }

                    if (m.content === "Error: not enough kakera!") {
                        return mudaeCollector.stop("end");
                    }
                });

                mudaeCollector.on("end", (collected, reason) => {
                    if (reason === "time") reject("L'achat n'a pas abouti.");
                    if (reason === "end") reject("Kakera insuffisant");
                });
            }

            if (reason === "time") reject("Temps écoulé");
            if (reason === "end") reject("Opération annulée");
        });
    });
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("abuy")
        .setDescription("Buy auction entries")
        .setDMPermission(false)
        .addIntegerOption((option) =>
            option
            .setName("auction-id")
            .setDescription("Auction's id")
            .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
            .setName("entries")
            .setDescription("Number of entries to buy")
            .setMinValue(1)
            .setRequired(true)
        ),
    async execute(client, interaction) {
        await interaction.deferReply();
        const { options, member, channel } = interaction;
        const id = options.getInteger("auction-id");
        const entries = options.getInteger("entries");
        let userParticipation;

        const [user] = await User.findOrCreate({ where: { id: member.id } });

        if (user.occupied) {
            return await interaction.followUp(
                "Tu as déjà une opération en cours..."
            );
        }

        const auction = await Auction.findByPk(id);
        if (auction === null) {
            return await interaction.editReply("Tirage introuvable.");
        }
        if (auction.status !== Auction.ONGOING_STATUS) {
            return await interaction.editReply(
                "Ce tirage n'accepte pas de participation."
            );
        }
        if (auction.user_id === member.id) {
            return await interaction.editReply("Ce tirage t'appartiens.");
        }
        if (auction.max_entries !== null || auction.max_user_entries !== null) {
            userParticipation = await AuctionParticipation.findOne({
                where: { user_id: member.id, auction_id: id },
            });
            if (auction.max_user_entries) {
                if (
                    entries > auction.max_user_entries ||
                    (userParticipation &&
                        userParticipation.entries + entries > auction.max_user_entries)
                ) {
                    return await interaction.editReply(
                        "Le nombre d'entrées que tu souhaites acheter dépasse la limite autorisée par utilisateur pour ce tirage."
                    );
                }
            }

            if (auction.max_entries) {
                const entriesSum = await AuctionParticipation.sum("entries", {
                    where: { auction_id: id },
                });
                if (
                    entries > auction.max_entries ||
                    (userParticipation && entriesSum + entries > auction.max_entries)
                ) {
                    return await interaction.editReply(
                        "Le nombre d'entrées que tu souhaites acheter dépasse la limite autorisée pour ce tirage."
                    );
                }
            }
        }

        const amount = entries * (auction.entry_price || Auction.DEFAULT_PRICE);
        await interaction.editReply(
            `Pour confirmer ton achat, tapes la commande: \`$givek ${auction.user_id} ${amount}\`\n` +
            `Une fois la commande validée, ton achat sera effectif.:\n` +
            `Pour annuler l'opération, tapes \`${exitWord}\`.`
        );

        await user.update({ occupied: true });

        buyingProcess(channel, member, auction, amount)
            .then(async() => {
                await user.update({ occupied: false });
                if (moment(auction.end_date).isBefore(moment())) {
                    return await interaction.followUp({
                        content: "Le tirage a eu le temps de se terminer, dommage pour toi. ¯\\_(ツ)_/¯\n" + 
							"Demande vite un remboursement !",
                    });
                }

                [userParticipation, created] = await AuctionParticipation.findOrCreate({
                    where: {
                        user_id: member.id,
                        auction_id: id,
                    },
                    defaults: {
                        entries: entries,
                        created_at: new Date(),
                    },
                });

                if (!created) {
                    userParticipation.entries += entries;
                    await userParticipation.save();
                }

                await interaction.followUp({ content: "Achat effectué !" });
            })
            .catch(async(e) => {
                await user.update({ occupied: false });
                await interaction.followUp({ content: e + ", achat annulé." });
            });
    },
};