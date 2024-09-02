const { WebhookClient, roleMention } = require('discord.js');

const webhookId = process.env.WEBHOOK_ID;
const webhookToken = process.env.WEBHOOK_TOKEN;

const webhookClient = new WebhookClient({
	id: webhookId,
	token: webhookToken,
});

const roleId = process.env.ROLE_ID;
const roleMent = roleMention(roleId);

if (!webhookId || !webhookToken) {
	console.error('Webhook ID or Webhook Token is missing');
	process.exit(1);
}

if (!roleId) {
	console.error('Role ID is missing');
	process.exit(1);
}

function sendMessage() {
	webhookClient
		.send(
			`Good Morning! ${roleMent} Office Hours will be held this Wednesday and Thursday following our class session. No addition zoom links are needed, just stick around after class has concluded.`
		)
		.catch(console.error);
}

sendMessage();
