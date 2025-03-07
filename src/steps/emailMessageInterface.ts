// Purpose: Interface for email message.
export interface EmailMessage {
    id: number;
    from: string;
    subject: string;
    date: string;
    body: string;
}