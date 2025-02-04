// require('dotenv').config();
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
	const zoomLinkTueFri = '[Zoom Link](https://us02web.zoom.us/j/88918893021)';
	const zoomLinkSun = '[Zoom Link](https://us02web.zoom.us/j/81934017172)';

	const today = new Date();
	const cohortStartDate = new Date('2025-02-10');

	if (today >= cohortStartDate) {
		webhookClient.send(
			`Good Morning! ${roleMent} Office Hours will be held this Tuesday and Friday from 5:00PM - 6:30PM EST. ${zoomLinkTueFri} Additional weekend office hours will be held on Sunday from 9:00AM - 11:00AM EST. ${zoomLinkSun}`
		);
	} else {
		webhookClient.send('TEST');
	}
}

sendMessage();
