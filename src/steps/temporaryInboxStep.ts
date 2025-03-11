import { expect, Page } from '@playwright/test';
import { EmailMessageResponseModel } from '../models/emailMessageModel';
import * as fs from 'fs';
import { ApiError } from '../models/apiErrorModel';
import axios from 'axios';
import { MailTmResponse } from '../models/mailTmResponseModel';

export class TemporaryInboxStep {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    createTemporaryEmail = async (emailFilePath: string): Promise<MailTmResponse> => {
        const apiUrl = 'https://api.mail.tm/accounts';
        const randomNumber = Math.floor(Math.random() * 1001);
        const accountData = {
            "address": `example${randomNumber}@indigobook.com`,
            "password": "your_password03"
        }

        try {
            const response = await axios.post(apiUrl, accountData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            fs.writeFileSync(emailFilePath, JSON.stringify(response.data, null, 2), 'utf8');
            return response.data as MailTmResponse;

        } catch (error: any) {
            if (error.response) {
                throw new ApiError(
                    'Error while calling API',
                    error.response.status,
                    error.response.data
                );
            } else {
                throw new ApiError(error.message);
            }
        }
    }

    generateEmailAccessToken = async (emailFilePath: string, tokenPath: string) => {
        const data = await this.getSavedEmailSync(emailFilePath);
        const email = data?.address;
        const apiUrl = 'https://api.mail.tm/token';
        const accountData = {
            "address": email,
            "password": "your_password03"
        }
        try {
            const response = await axios.post(apiUrl, accountData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            fs.writeFileSync(tokenPath, JSON.stringify(response.data, null, 2), 'utf8');
            console.log('token', response.data.token);
            return response.data.token;

        } catch (error: any) {
            if (error.response) {
                throw new ApiError(
                    'Error while calling API with status code: ' + error.response.status,
                );
            } else {
                throw new ApiError(error.message);
            }
        }
    };

    getSavedEmailSync = async (emailFilePath: string): Promise<MailTmResponse | null> => {
        if (fs.existsSync(emailFilePath)) {
            const fileContent = fs.readFileSync(emailFilePath, 'utf8');
            return JSON.parse(fileContent) as MailTmResponse;
        }
        return null;
    }

    getSavedTokenSync = async (tokenFilePath: string) => {
        if (fs.existsSync(tokenFilePath)) {
            const fileContent = fs.readFileSync(tokenFilePath, 'utf8');
            const parsedContent = JSON.parse(fileContent);

            return typeof parsedContent === 'string' ? parsedContent : parsedContent.token;
        }
        return null;
    };

    isTokenExpired = (token: string): boolean => {
        const payloadBase64 = token.split('.')[1];
        const payloadDecoded = JSON.parse(atob(payloadBase64));
        const exp = payloadDecoded.exp;
        const now = Math.floor(Date.now() / 1000);

        return exp < now;
    };

    checkInboxExists = async (account: MailTmResponse, authToken: string) => {
        const accountId = account?.id;
        const accountUrl = `https://api.mail.tm/accounts/${accountId}`;

        try {
            const response = await axios.get(accountUrl, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            return response.data as MailTmResponse;
        } catch (error: any) {
            if (error.response) {
                throw new ApiError(
                    'Error while calling API with status code: ' + error.response.status,
                );
            } else {
                throw new ApiError(error.message);
            }
        }
    };

    getTemporaryEmail = async (emailFilePath: string, pathAuthToken: string) => {
        let email = await this.getSavedEmailSync(emailFilePath);
        if (!email) {
            email = await this.createTemporaryEmail(emailFilePath);
        }
        else {
            const authToken = await this.generateEmailAccessToken(emailFilePath, pathAuthToken);
            const account = await this.checkInboxExists(email, authToken);
            console.log('account', account?.address);

            if (account?.isDeleted) {
                email = await this.createTemporaryEmail(emailFilePath);
            }
        }
        return email;
    };

    getTemporaryToken = async (emailFilePath: string, pathAuthToken: string) => {
        let token = await this.getSavedTokenSync(pathAuthToken);

        if (!token || this.isTokenExpired(token)) {
            console.log('Токен отсутствует или истёк. Генерация нового токена...');
            token = await this.generateEmailAccessToken(emailFilePath, pathAuthToken);
        }

        return token;
    };

    getEmailMessages = async (authToken: string) => {
        const accountUrl = `https://api.mail.tm/messages`;

        try {
            const response = await axios.get(accountUrl, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            console.log('response', response.status);
            return response.data['hydra:member'] as EmailMessageResponseModel[];
        } catch (error: any) {
            if (error.response) {
                throw new ApiError(
                    'Error while calling API with status code: ' + error.response.status + 'response data: ' + error.response.data.message,
                );
            } else {
                throw new ApiError(error.message);
            }
        }
    };

    getEmailMessageById = async (messageId: string, authToken: string) => {
        const messagesUrl = `https://api.mail.tm/messages`;
        const messageDetailsResponse = await axios.get(
            `${messagesUrl}/${messageId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        );
        return messageDetailsResponse.data as EmailMessageResponseModel;
    };

    getMessagesWithWait = async (authToken: string, count: number) => {
        let messages: EmailMessageResponseModel[] = [];
        while (messages.length === count) {
            messages = await this.getEmailMessages(authToken);
            if (messages.length === count) {
                await new Promise(resolve => setTimeout(resolve, 50000));
            }
            return messages;
        }
    };

    getConfirmationLink = async (authToken: string, expectedText: string) => {
        const emailMassages = await this.getMessagesWithWait(authToken, 0);
        let id: string = "";
        let cleanLink: string = "";

        if (emailMassages && emailMassages.length > 0) {
            id = emailMassages[emailMassages.length - 1].id;
        }
        else {
            throw new Error("The message not found!");
        }

        console.log(`id=${id}`);

        const message = await this.getEmailMessageById(id, authToken);
        console.log('message', message.text);
        expect(message).toBeDefined();
        expect(message?.subject).toContain(expectedText);
        const regex = /\[?(https?:\/\/[^\s\[\]]+)\]?/g;
        const match = message?.text ? message.text.match(regex) : [];

        if (match) {
            const confirmationLink = match.find(link => link.includes("/Invite/")) || match[0];
            cleanLink = confirmationLink ? confirmationLink.replace(/^\[|\]$/g, "") : "";
        }
        return cleanLink;
    }

    gotoConfirmationLink = async (authToken: string, text: string) => {
        const cleanLink = await this.getConfirmationLink(authToken, text);
        if (cleanLink) {
            await this.page.goto(cleanLink);
        }
        else {
            throw new Error("The link not found!");
        }
    }

    clearInbox = async (authToken: string) => {
        const messagesUrl = 'https://api.mail.tm/messages';
        const messages = await this.getEmailMessages(authToken);

        if (messages.length !== 0) {
            for (const message of messages) {
                await axios.delete(`${messagesUrl}/${message.id}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
            }
        }
    };

    waitForUnseenMessages = async (authToken: string, timeout: number = 60000) => {
        const start = Date.now();
        let unseenMessages = [];

        while ((Date.now() - start) < timeout) {
            const messages = await this.getMessagesWithWait(authToken, 0);
            unseenMessages = messages ? messages.filter(m => m.seen === false) : [];

            if (unseenMessages.length > 0) {
                console.log('Найдено непрочитанных сообщений:', unseenMessages.length);
                return unseenMessages;
            }

            console.log('Непрочитанных сообщений пока нет. Ожидание...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        throw new Error('Непрочитанные сообщения не появились в течение указанного времени.');
    };

    expectMessagesCountInInbox = async (authToken: string, expectedText: string) => {
        const emailMassages = await this.getMessagesWithWait(authToken, 1);
        const message = emailMassages?.filter(m => m.subject.includes(expectedText));
        expect(message?.length).toBeGreaterThan(1);
    }

    expectUnseenMessagesInInbox = async (authToken: string) => {
        const unseenMessages = await this.waitForUnseenMessages(authToken);
        expect(unseenMessages.length).toBeGreaterThan(0);
    }
}