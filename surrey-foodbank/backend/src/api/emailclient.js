import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export default class EmailClient {
    faceEmail = "no-reply@sfb.ca"
    faceName = "Surrey Food Bank"

    async checkEmail(email) {
    }

    async sendConfirmation(name, address, date) {
        const mailgun = new Mailgun(FormData);
        const mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY
            // When you have an EU-domain, you must specify the endpoint:
            // url: "https://api.eu.mailgun.net"
        });

        try {
            const data = await mg.messages.create(process.env.MAILGUN_ADDRESS, {
                from: `${this.faceName} <${this.faceEmail}>`,
                to: [`${name} <${address}>`],
                subject: "Appointment Booked! [DEMO EMAIL]",
                template: "Confirmation",
                "h:X-Mailgun-Variables": JSON.stringify({
                    name: name,
                    date: date
                }),
            });
            console.log(data); // logs response data
        } catch (error) {
            console.log(error); // logs any error
        }
        console.log("Mailgun Confirm Sent");
    }

    async sendCancellation(name, address, date) {
        const mailgun = new Mailgun(FormData);

        const mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY
            // When you have an EU-domain, you must specify the endpoint:
            // url: "https://api.eu.mailgun.net"
        });

        try {
            const data = await mg.messages.create(process.env.MAILGUN_ADDRESS, {
                from: `${this.faceName} <${this.faceEmail}>`,
                to: [`${name} <${address}>`],
                subject: "Appointment Cancelled! [DEMO EMAIL]",
                template: "cancellation",
                "h:X-Mailgun-Variables": JSON.stringify({
                    name: name,
                    date: date
                }),
            });
            console.log(data); // logs response data
        } catch (error) {
            console.log(error); // logs any error
        }
        console.log("Mailgun Cancel Sent");

    }

}