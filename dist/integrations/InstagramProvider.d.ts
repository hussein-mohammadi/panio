export interface InstagramMessageInput {
    text: string;
    userId: number;
}
export interface InstagramParsedMessage {
    valid: boolean;
    parsedText?: string;
    reason?: string;
}
export declare class InstagramProvider {
    parseMessage(input: InstagramMessageInput): InstagramParsedMessage;
}
