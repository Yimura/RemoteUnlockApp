import BaseMessage, { MessageType } from "./BaseMessage";
import { BufferField } from "./BufferField";

const PASSWORD_FIELD = new BufferField(0x1, 32);

export class AuthenticateMessage extends BaseMessage {
    constructor(password: string) {
        super(MessageType.AUTHENTICATE);

        this.setPassword(password);
    }

    setPassword(password: string): void {
        this.data.writeString(password, PASSWORD_FIELD);
    }
}
