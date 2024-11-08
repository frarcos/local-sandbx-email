const SMTPServer = require('smtp-server').SMTPServer;
const { simpleParser } = require('mailparser');
const express = require('express');

const app = express();
const port = 3000;
const receivedEmails = [];

const smtpServer = new SMTPServer({
	secure: false,
	port: 25,
	banner: 'Welcome to My Secure SMTP Server',
	disabledCommands: ['AUTH'],
	onConnect(session, callback) {
		console.log('Client connected:', session.remoteAddress);
		callback();
	},
	onError(err) {
		console.error('Server error:', err);
	},
	onData(stream, session, callback) {
		simpleParser(stream, (err, parsed) => {
			if (err) {
				console.error('Error parsing email:', err);
				return callback(err);
			}

			const attachments = (parsed.attachments || []).map((attachment) => ({
				filename: attachment.filename,
				contentType: attachment.contentType,
				content: attachment.content,
			}));

			receivedEmails.push({
				subject: parsed.subject,
				from: parsed.from.text,
				to: parsed.to.text,
				text: parsed.text,
				html: parsed.html,
				date: new Date(),
				attachments,
			});

			console.log('Parsed Email:', parsed);
			callback();
		});
	},
});

smtpServer.listen(25, () => {
	console.log('SMTP server is running on port 25');
});

const bootstrapCDN = `
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
`;

app.get('/', (req, res) => {
	let emailList = `
        ${bootstrapCDN}
        <div class="container mt-5">
            <h1 class="mb-4">Received Emails</h1>
    `;

	if (receivedEmails.length === 0) {
		emailList += '<div class="alert alert-info">No emails received yet.</div>';
	} else {
		emailList += '<ul class="list-group">';
		receivedEmails.forEach((email, index) => {
			emailList += `
                <li class="list-group-item">
                    <h5>${email.subject}</h5>
                    <p><strong>From:</strong> ${email.from} <br/>
                    <strong>To:</strong> ${email.to} <br/>
                    <strong>Date:</strong> ${email.date.toLocaleString()}</p>
                    <a href="/email/${index}" class="btn btn-primary btn-sm">View Full Email</a>
                </li>
            `;
		});
		emailList += '</ul>';
	}

	emailList += '</div>';
	res.send(emailList);
});

app.get('/email/:id', (req, res) => {
	const emailId = parseInt(req.params.id);
	if (emailId >= 0 && emailId < receivedEmails.length) {
		const email = receivedEmails[emailId];

		let attachmentList = '';
		if (email.attachments.length > 0) {
			attachmentList += '<h3>Attachments</h3><ul>';
			email.attachments.forEach((attachment, index) => {
				attachmentList += `
					<li>
						<a href="/email/${emailId}/attachment/${index}" target="_blank">
							${attachment.filename || 'Unnamed Attachment'}
						</a> (${attachment.contentType})
					</li>
				`;
			});
			attachmentList += '</ul>';
		} else {
			attachmentList = '<p>No attachments</p>';
		}

		res.send(`
            ${bootstrapCDN}
            <div class="container mt-5">
                <h1>Email Detail</h1>
                <p><strong>Subject:</strong> ${email.subject}</p>
                <p><strong>From:</strong> ${email.from}</p>
                <p><strong>To:</strong> ${email.to}</p>
                <p><strong>Date:</strong> ${email.date.toLocaleString()}</p>
                <h3>Text Body</h3>
                <p>${email.text}</p>
                <h3>HTML Body</h3>
                <div>${email.html}</div>
                ${attachmentList}
                <a href="/" class="btn btn-secondary mt-3">Back to Inbox</a>
            </div>
        `);
	} else {
		res.status(404).send('Email not found');
	}
});

app.get('/email/:emailId/attachment/:attachmentId', (req, res) => {
	const emailId = parseInt(req.params.emailId);
	const attachmentId = parseInt(req.params.attachmentId);

	if (emailId >= 0 && emailId < receivedEmails.length) {
		const email = receivedEmails[emailId];

		if (attachmentId >= 0 && attachmentId < email.attachments.length) {
			const attachment = email.attachments[attachmentId];

			res.setHeader(
				'Content-Disposition',
				`attachment; filename="${attachment.filename || 'attachment'}"`
			);
			res.setHeader('Content-Type', attachment.contentType);
			res.send(attachment.content);
		} else {
			res.status(404).send('Attachment not found');
		}
	} else {
		res.status(404).send('Email not found');
	}
});

app.listen(port, () => {
	console.log(`Web server is running at http://localhost:${port}`);
});
