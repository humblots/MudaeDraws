module.exports = {
	name: 'interactionCreate',
	execute(client, interaction) {
		if (interaction.isChatInputCommand()) {
			const { commandName } = interaction;
			const command = client.commands.get(commandName);
			if (!command) return;
			
			command.execute(interaction);
		}
	},
};