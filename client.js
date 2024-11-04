const nodemailer = require('nodemailer');
const fs = require('fs');

// Load your SSL certificate and key if needed
// For self-signed certificates, you may want to use tls options
const transporter = nodemailer.createTransport({
	host: 'localhost',
	port: 25, // Use port 465 for SSL
	secure: false, // Use SSL
	tls: {
		rejectUnauthorized: false, // Allow self-signed certificates
	},
});

const mailOptions = {
	from: '"Sender Name" <your-email@example.com>', // Sender address
	to: 'recipient@example.com', // List of receivers
	subject: 'Test Email', // Subject line
	text: 'Hello, this is a test email!', // Plain text body
	html: '<b>Hello, this is a test email!</b>', // HTML body
};

// Send email
transporter.sendMail(mailOptions, (error, info) => {
	if (error) {
		return console.log('Error occurred:', error);
	}
	console.log('Email sent:', info.response);
});
