// @flow

import config from 'config';
import SendGrid, { mail as helper } from 'sendgrid';
import type { SuccessMessage } from '../types';
import { isEmail, randomToken } from '../utils';
import { BadRequestError } from '../errors';

const TEAM_EMAIL = process.env.TEAM_EMAIL || config.get('sendgrid.email');
const SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY || config.get('sendgrid.key');

// Email templating
const EMAIL_FOOTER = `<br><br>Sincerely,<br>The WildHacks Team 😺`;

function EmailService(fromEmail: string) {
    this.sg = SendGrid(SEND_GRID_API_KEY);
    this.sender = new helper.Email(fromEmail); 
}

EmailService.prototype.sendEmail = async function(subject: string, body: string, recipient: string): Promise<Object> {
    if (!isEmail(recipient)) {
        throw new BadRequestError('Recipient is not a valid email address');
    }

    const toEmail = new helper.Email(recipient);
    const content = new helper.Content('text/html', body);
    const mail = new helper.Mail(this.sender, subject, toEmail, content);
    const request = this.sg.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail
    });

    return this.sg.API(request); 
};

EmailService.prototype.sendVerificationEmail = async function(recipient: string): Promise<SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        const token = await randomToken();
        const subject = 'Verify your email for WildHacks!';
        const content = `
                <section style="text-align:center;">
                    <h1>🎉👏🙏<b>Hey! Thanks for signing up for WildHacks!</b>🙏👏🎉</h1>
                    <br>
                    <img src='https://78.media.tumblr.com/1a7f0bc42f067a83ad88111500e74439/tumblr_np81muoTrZ1rm5s50o1_400.gif' />
                    <br><br>
                    <h3 style="font-weight:400; text-align:left;">
                        Please follow this link https://wildhacks.org/verify/${token} to verify your email and complete your sign up 🤗
                    </h3>
                    ${EMAIL_FOOTER}
                </section>
             `; 

        try {
            const response = await this.sendEmail(subject, content, recipient);
            resolve({
                success: true,
                message: 'Successfully sent verification email to ${recipient}',
            });
        } catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

EmailService.prototype.sendResetPasswordEmail = async function(recipient: string): Promise<SuccessMessage> {
    return new Promise(async (resolve, reject) => {
        const token = await randomToken();
        const subject = 'Reset your password for your WildHacks account';
        const content = `
                <section style="text-align:center;">
                    <h3 style="font-weight:400">
                        Please follow this link https://wildhacks.org/reset-password/${token} to reset your password
                    </h3>
                    ${EMAIL_FOOTER}
                </section>
             `; 

        try {
            const response = await this.sendEmail(subject, content, recipient);
            resolve({
                success: true,
                message: 'Successfully sent password reset email to ${recipient}',
            });
        } catch(err) {
            console.log(err);
            reject(err);
        }
    });
};

export default new EmailService(TEAM_EMAIL);
