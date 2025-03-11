export interface EmailMessageResponseModel {
    id: string;
    from: {
        address: string;
        name: string;
    };
    to: {
        address: string;
        name: string;
    };
    subject: string;
    intro: string;
    seen: boolean;
    createdAt: string;
    text: string;
    html: string;
}

export interface GetMessagesResponseModel {
    "@context": string;
    "@id": string;
    "@type": string;
    "hydra:totalItems": number;
    "hydra:member": EmailMessageResponseModel[];
}