import { expect, Page } from '@playwright/test';
import fetch from 'node-fetch';
import { EmailMessage } from './emailMessageInterface';
import * as fs from 'fs';

export class TemporaryInboxStep {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    createTemporaryEmail = async (emailFilePath: string) => {
        const response = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox');
        const data = await response.json();

        if (!Array.isArray(data) || !data.every(item => typeof item === "string")) {
            throw new Error("Invalid response format: expected an array of strings");
        }

        const email = data[0];
        console.log(`Temporary email: ${email}`);
        fs.writeFileSync(emailFilePath, email, 'utf8');
        return email;
    };

    getSavedEmailSync = async (emailFilePath: string) => {
        if (fs.existsSync(emailFilePath)) {
            const email = fs.readFileSync(emailFilePath, 'utf8');
            return email;
        }
        return null;
    }

    getTemporaryEmail = async (emailFilePath: string) => {
        let email = await this.getSavedEmailSync(emailFilePath);
        if (!email) {
            email = await this.createTemporaryEmail(emailFilePath);
        }
        return email;
    };

    getEmailMessages = async (email: string) => {
        const [username, domain] = email.split('@');
        const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`);
        const messages = await response.json() as EmailMessage[];
        return messages;
    };

    getEmailMessageById = async (email: string, messageId: number) => {
        const [username, domain] = email.split('@');
        const response = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${messageId}`);
        const message = await response.json() as { body: string };
        return message;
    };

    getMessages = async (email: string) => {
        let messages: EmailMessage[] = [];
        while (messages.length === 0) {
            messages = await this.getEmailMessages(email);
            if (messages.length === 0) {
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
            return messages;
        }
    };

    getConfirmationLink = async (inboxId: string, text: string) => {
        const emailMassage = await this.getMessages(inboxId);
        const message = emailMassage?.filter(m => m.subject.includes('text'))[0];
        expect(message).toBeDefined();
        expect(message?.subject).toContain(text);
        const regex = /https?:\/\/[^\s<>"]+/g;
        const match = message?.body ? message.body.match(regex) : [];
        let cleanLink: string = "";

        if (match) {
            const confirmationLink = match.find(link => link.includes("/Invite/")) || match[0];
            cleanLink = confirmationLink ? confirmationLink.replace(/["<>]/g, "") : "";
        }
        return cleanLink;
    }

    gotoConfirmationLink = async (inboxId: string, text: string) => {
        const cleanLink = await this.getConfirmationLink(inboxId, text);
        if (cleanLink) {
            await this.page.goto(cleanLink);
        }
        else {
            throw new Error("The link not found!");
        }
    }

    deleteEmailMessage = async (email: string, messageId: number) => {
        const [username, domain] = email.split('@');
        await fetch(`https://www.1secmail.com/api/v1/?action=deleteMessage&login=${username}&domain=${domain}&id=${messageId}`);
    }

    clearInbox = async (email: string) => {
        const messages = await this.getEmailMessages(email);
        for (const message of messages) {
            await this.deleteEmailMessage(email, message.id);
        }
    }
}