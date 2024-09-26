import { BufferField } from "models/BufferField";

export class Buffer extends Array<number> {
    constructor(buf: number[] = []) {
        super(...buf);
    }

    readString(field: BufferField): string {
        return this.slice(field.offset, field.offset + field.size).map(val => String.fromCharCode(val)).join('');
    }

    readUint8(field: BufferField): number {
        return this[field.offset];
    }

    writeString(value: string, field: BufferField): void {
        const offset = field.offset;

        for (let i = 0; i < field.size; ++i) {
            // zero out everything past the string value
            if (i >= value.length) {
                this[offset + i] = 0x0;

                continue;
            }

            this[offset + i] = value.charCodeAt(i);
        }
    }

    writeUint8(value: number, field: BufferField) {
        if (value > 255 || value < 0) {
            throw new RangeError("Invalid number passed to writeUint8, accepted range is [0, 255]");
        }

        this[field.offset] = value;
    }
};
