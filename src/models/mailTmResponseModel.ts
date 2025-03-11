export interface MailTmResponse {
    id: string;
    address: string;
    quota: number;
    used: number;
    isDisabled: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}