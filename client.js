const nodemailer = require('nodemailer');
const fs = require('fs');

// Load your SSL certificate and key if needed
// For self-signed certificates, you may want to use tls options
const transporter = nodemailer.createTransport({
	host: 'localhost',
	port: 465, // Use port 465 for SSL
	secure: true, // Use SSL
	auth: {
		user: 'abc',
		pass: 'def',
	},
	tls: {
		// Accept self-signed certificates
		rejectUnauthorized: false,
		// If you have a certificate file, you can use:
		// key: fs.readFileSync('path/to/private.key'),
		// cert: fs.readFileSync('path/to/certificate.crt'),
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
