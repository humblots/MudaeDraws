module.exports = {
	name: 'interactionCreate',
	execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const { client, commandName } = interaction;
		const command = client.commands.get(commandName);
		if (!command) return;

		command.execute(interaction);
	},
};