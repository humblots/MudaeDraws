const { CronJob } = require('cron');
const { DEFAULT_PREFIX } = require('../config.json');
const { updateStatus, pickWinners } = require('../utils/auction-cron');

// Mass updates on pending auctions
// Then Mass updates on finished auctions, results calculations and sending.
const onTick = async client => {
	await updateStatus(client);
	await pickWinners(client);
};

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.user.setPresence({activities: [{name: `${DEFAULT_PREFIX}help` , type: 'PLAYING'}], status: 'online'});
		console.log(`Ready! Logged in as ${client.user.tag}`);
		new CronJob(
			'0 * * * * *',
			() => onTick(client),
		).start();
	},
};
