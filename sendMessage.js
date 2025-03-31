require('dotenv').config();
const { WebhookClient, roleMention } = require('discord.js');

// Discord vars
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
	const zoomLinkTueFri =
		'[Zoom Link](<https://us02web.zoom.us/j/88918893021>)';

	const zoomLinkSun = '[Zoom Link](<https://us02web.zoom.us/j/81934017172>)';

	const today = new Date();

	const cohortStartDate = new Date('2025-02-10');

	if (today >= cohortStartDate) {
		webhookClient.send(
			`Good Morning ${roleMent}!\nOffice Hours will be held on Tuesday and Friday from 5:00PM - 6:30PM EST. ${zoomLinkTueFri}\nAdditional weekend office hours will be held on Sunday from 9:00AM - 11:00AM EST. ${zoomLinkSun}`
		);

		webhookClient.send(
			// mapping each object from assignmentsDue with some markdown formatting

			`# Upcoming Due Dates\n${assignmentsDue
				.map(
					(a) =>
						`- **[${a.name}](<https://uprighted.instructure.com/courses/${courseId}/assignments/${a.id}>)** : ${a.date}`
				)
				.join('\n')}`
		);
	}
}

// Canvas vars
const canvasToken = process.env.CANVAS_TOKEN;
const courseId = process.env.CANVAS_COURSE_ID;
const canvasUrl = `https://uprighted.instructure.com/api/v1/courses/${courseId}/assignments`;

if (!canvasToken) {
	console.error('Canvas token invalid');
	process.exit(1);
}

if (!courseId) {
	console.error('Course id invalid');
	process.exit(1);
}

const assignmentsDue = [];

async function getAssignmentInfo() {
	await fetch(canvasUrl, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${canvasToken}`,
			'Content-Type': 'application/json',
		},
	})
		.then((response) => response.json())
		.then((data) => {
			data.forEach((assignment) => {
				const dueDate = assignment.due_at // converting due dates from utc to est
					? convertToEastern(assignment.due_at)
					: 'No due date';
				const dueSoon = assignment.due_at // true if with in 7 days else false
					? isWithIn7Days(assignment.due_at)
					: false;

				if (dueSoon) {
					console.log(`${assignment.name} : due ${dueDate}`);
					assignmentsDue.push({
						id: assignment.id,
						name: assignment.name,
						date: dueDate,
					});
				}
			});
		})
		.catch((error) => {
			console.error('Error fetching assignments', error);
		});
}

function convertToEastern(dateStr) {
	const date = new Date(dateStr); // parsing the datestring from canvas to a date object
	return date.toLocaleString('en-US', {
		timeZone: 'America/New_York',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true,
	});
}
// compares due dates with today, if with in 7 days of today returns true
function isWithIn7Days(dateStr) {
	const dueDate = new Date(dateStr);
	const today = new Date();

	// normalizing data to midnight
	today.setHours(0, 0, 0, 0);
	dueDate.setHours(0, 0, 0, 0);

	const diffInMs = dueDate - today;
	const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

	return diffInDays >= 0 && diffInDays <= 7;
}

function sortByDueDate(arr) {
	let swapped;
	do {
		swapped = false;
		for (let i = 0; i < arr.length - 1; i++) {
			let next = i + 1;
			if (arr[i].date > arr[i + 1].date) {
				[arr[i], arr[next]] = [arr[next], arr[i]];
				swapped = true;
			}
		}
	} while (swapped);

	return arr;
}

async function main() {
	await getAssignmentInfo();
	sortByDueDate(assignmentsDue);
	sendMessage();
}

main();
