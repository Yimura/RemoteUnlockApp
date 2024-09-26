import BaseMessage, { MessageType } from "./BaseMessage";
import { BufferField } from "./BufferField";

export enum Command {
    OPEN = 0x00,
    CLOSE = 0x01
};

const CMD_FIELD = new BufferField(0x1);

export default class CommandMessage extends BaseMessage {
    constructor(cmd: Command) {
        super(MessageType.COMMAND);

        this.setCommand(cmd);
    }

    setCommand(cmd: Command): void {
        this.data.writeUint8(cmd as number, CMD_FIELD);
    }
}
