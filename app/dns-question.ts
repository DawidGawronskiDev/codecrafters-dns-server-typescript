import type { QuestionInterface, QuestionType, QuestionClass } from "./types";

export class Question implements QuestionInterface {
  name: string;
  type: QuestionType;
  class: QuestionClass;

  constructor(name: string, type: QuestionType, class_: QuestionClass) {
    this.name = name;
    this.type = type;
    this.class = class_;
  }

  toBuffer(): Buffer {
    const nameParts: string[] = this.name.split(".");
    const nameBufferArray: Buffer[] = [];

    for (const part of nameParts) {
      const length: number = part.length;
      const lengthBuffer: Buffer = Buffer.alloc(1);
      lengthBuffer.writeUInt8(length, 0);
      const partBuffer: Buffer = Buffer.from(part, "utf-8");
      nameBufferArray.push(lengthBuffer, partBuffer);
    }

    // Add a zero-length octet to terminate the name
    nameBufferArray.push(Buffer.alloc(1));

    const typeBuffer: Buffer = Buffer.alloc(2);
    typeBuffer.writeUInt16BE(this.type, 0);

    const classBuffer: Buffer = Buffer.alloc(2);
    classBuffer.writeUInt16BE(this.class, 0);

    return Buffer.concat([...nameBufferArray, typeBuffer, classBuffer]);
  }
}

class QuestionBuilder {
  private name: string;
  private type: QuestionType;
  private class_: QuestionClass;

  constructor() {
    this.name = "";
    this.type = 1; // Default to A record
    this.class_ = 1; // Default to IN class
  }

  withName(name: string): QuestionBuilder {
    this.name = name;
    return this;
  }

  withType(type: QuestionType): QuestionBuilder {
    this.type = type;
    return this;
  }

  withClass(class_: QuestionClass): QuestionBuilder {
    this.class_ = class_;
    return this;
  }

  build(): Question {
    return new Question(this.name, this.type, this.class_);
  }
}

export const questionBuilder = new QuestionBuilder();
