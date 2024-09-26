import { Buffer } from "util/Buffer";
import { BufferField } from "./BufferField";

export enum MessageType {
    AUTHENTICATE = 0x00,
    COMMAND = 0x01
};

const TYPE_FIELD = new BufferField(0x0);

export default class BaseMessage {
    constructor(private type: MessageType, protected data: Buffer = new Buffer()) {
        this.data.push(type);
    }

    getType(): MessageType {
        return this.type;
    }

    /**
     * Takes a ByteBuffer and converts it to type <T extends BaseMessage>
     * @param buffer ByteBuffer from BleManager.read(...) call
     * @returns {T}
     */
    static deserialize<T extends BaseMessage>(buffer: number[]): T {
        const type = buffer[TYPE_FIELD.offset] as MessageType;

        return new BaseMessage(type, new Buffer(buffer)) as T;
    }

    /**
     * @returns {number[]} Copy of the internal ByteBuffer
     */
    serialize(): number[] {
        return [...this.data];
    }
};
