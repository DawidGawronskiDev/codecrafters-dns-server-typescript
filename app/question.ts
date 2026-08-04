import type { QuestionInterface, QuestionType, QuestionClass } from "./types";

export function encodeName(name: string): Buffer {
  const labelBuffers: Buffer[] = name.split(".").map((part) => {
    const lengthBuffer = Buffer.alloc(1);
    lengthBuffer.writeUInt8(part.length, 0);
    return Buffer.concat([lengthBuffer, Buffer.from(part, "utf-8")]);
  });

  // Terminating 0-length byte
  return Buffer.concat([...labelBuffers, Buffer.alloc(1)]);
}

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
    const typeBuffer: Buffer = Buffer.alloc(2);
    typeBuffer.writeUInt16BE(this.type, 0);

    const classBuffer: Buffer = Buffer.alloc(2);
    classBuffer.writeUInt16BE(this.class, 0);

    return Buffer.concat([encodeName(this.name), typeBuffer, classBuffer]);
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
