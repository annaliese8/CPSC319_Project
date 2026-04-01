import Mailgun from "mailgun.js"; // mailgun.js v11.1.0


export default class EmailClient {
    faceEmail = "no-reply@sfb.ca"
    faceName = "Surrey Food Bank"

    async checkEmail(email) {
    }

    static async sendSimpleMessage() {
        const mailgun = new Mailgun(FormData);
        const mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY
            // When you have an EU-domain, you must specify the endpoint:
            // url: "https://api.eu.mailgun.net"
        });
        try {
            const data = await mg.messages.create("sandboxf6c87e23773145909bca7e3bd396ccd1.mailgun.org", {
                from: "bob <nineranger@gmail.com>",
                to: ["N Tr <nineranger@gmail.com>"],
                subject: "Hello N",
                text: "Congratulations, you just sent an email with Mailgun! You are truly awesome!",
            });

            console.log(data); // logs response data
        } catch (error) {
            console.log(error); //logs any error
        }
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
            const data = await mg.messages.create("sandboxf6c87e23773145909bca7e3bd396ccd1.mailgun.org", {
                from: `${this.faceName} <${this.faceEmail}>`,
                to: [`${name} <${address}>`],
                subject: "Appointment Booked!",
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
        console.log("Mailgun Conf Sent");
    }

    async sendCancellation(name, address, date) {
        console.log("called?");
        const mailgun = new Mailgun(FormData);

        const mg = mailgun.client({
            username: "api",
            key: process.env.MAILGUN_API_KEY
            // When you have an EU-domain, you must specify the endpoint:
            // url: "https://api.eu.mailgun.net"
        });

        try {
            const data = await mg.messages.create("sandboxf6c87e23773145909bca7e3bd396ccd1.mailgun.org", {
                from: `${this.faceName} <${this.faceEmail}>`,
                to: [`${name} <${address}>`],
                subject: "Appointment Cancelled!",
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
