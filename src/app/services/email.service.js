// @flow

import fs from 'fs';
import path from 'path';
import config from 'config';
import SendGrid, { mail as helper } from 'sendgrid';
import type { EmailResponse } from '../types';
import { isEmail, randomToken } from '../utils';
import { BadRequestError } from '../errors';

const TEAM_EMAIL = process.env.TEAM_EMAIL || config.get('sendgrid.email');
const SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY || config.get('sendgrid.key');

const readFromHtml = function(templateName: string): string {
    const pathToHtml = path.resolve(global.cwd, 'static/templates/', templateName);
    const file = fs.readFileSync(pathToHtml, 'utf8');
    return file;
};

const createTemplate = function(literal: string, ...params: any): Function {
    return new Function(params, 'return `' + literal + '`;');
};

/* Templates */
const VERIFICATION_EMAIL_CONTENT = readFromHtml('verification-email.html');
const RESET_PASSWORD_EMAIL_CONTENT = readFromHtml('reset-password.html');
const EMAIL_FOOTER = readFromHtml('partials/footer.html');


/**
 * Email Sending Service
 * @param fromEmail email sender
 * @constructor
 */
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
        body: mail,
    });

    return this.sg.API(request); 
};

EmailService.prototype.sendVerificationEmail = async function(recipient: string, token: string): Promise<EmailResponse> {
    return new Promise(async (resolve, reject) => {
        const subject = 'Confirm your email for WildHacks.org!';
        const template = createTemplate(VERIFICATION_EMAIL_CONTENT, 'token', 'footer');

        try {
            await this.sendEmail(subject, template(token, EMAIL_FOOTER), recipient);
            resolve({
                success: true,
                message: 'Successfully sent verification email to ${recipient}',
                token,
            });
        } catch(err) {
            reject(err);
        }
    });
};

EmailService.prototype.sendResetPasswordEmail = async function(recipient: string): Promise<EmailResponse> {
    return new Promise(async (resolve, reject) => {
        const token = await randomToken();
        const subject = 'Reset your password for your WildHacks account';
        const template = createTemplate(RESET_PASSWORD_EMAIL_CONTENT, 'token', 'footer');

        try {
            await this.sendEmail(subject, template(token, EMAIL_FOOTER), recipient);
            resolve({
                success: true,
                message: 'Successfully sent password reset email to ${recipient}',
                token,
            });
        } catch(err) {
            reject(err);
        }
    });
};

export default new EmailService(TEAM_EMAIL);
