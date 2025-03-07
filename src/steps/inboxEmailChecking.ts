import { chromium } from 'playwright';
import fetch from 'node-fetch';

interface EmailMessage {
    id: number;
    from: string;
    subject: string;
    date: string;
    body: string;
}

async function createTemporaryEmail(): Promise<string> {
    const response = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox');
    const email = (await response.json())[0];
    console.log(`Temporary email: ${email}`);
    return email.emailAddress;
}

async function getEmailMessages(email: string): Promise<EmailMessage[]> {
    const [username, domain] = email.split('@');
    const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`);
    const messages = await response.json();
    return messages;
}

async function getEmailMessage(email: string, messageId: number): Promise<string> {
    const [username, domain] = email.split('@');
    const response = await fetch(`https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${messageId}`);
    const message = await response.json();
    return message.body;
}

async function getEmailMessages1(email: string): Promise<EmailMessage[]> {
    const [username, domain] = email.split('@');
    const response = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`);
    const messages = await response.json();
    return messages.map((msg: any) => ({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        date: msg.date,
        body: msg.body
    }));
}

(async () => {
    const email = await createTemporaryEmail();

    // Пример использования временного почтового ящика в тесте
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com/register');
    await page.fill('#email', email);
    await page.click('#register');

    // Ждем получения письма (может занять время)
    let messages: EmailMessage[] = [];
    while (messages.length === 0) {
        messages = await getEmailMessages(email);
        if (messages.length === 0) {
            console.log('Ожидание письма...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    const messageId = messages[0].id;
    const emailBody = await getEmailMessage(email, messageId);
    console.log(`Email body: ${emailBody}`);

    // Переход по ссылке в письме (пример)
    const linkMatch = emailBody.match(/https?:\/\/[^\s]+/);
    if (linkMatch) {
        const link = linkMatch[0];
        await page.goto(link);
        console.log(`Перешли по ссылке: ${link}`);
    } else {
        console.log('Ссылка в письме не найдена.');
    }

    await browser.close();
})();
