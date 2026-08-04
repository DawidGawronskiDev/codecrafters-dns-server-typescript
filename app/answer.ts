import type {
  AnswerClass,
  AnswerDataLength,
  AnswerInterface,
  AnswerName,
  AnswerTimeToLive,
  AnswerType,
} from "./types";

export class Answer implements AnswerInterface {
  name: AnswerName;
  type: AnswerType;
  class: AnswerClass;
  timeToLive: AnswerTimeToLive;
  dataLength: AnswerDataLength;

  constructor(answer: AnswerInterface) {
    this.name = answer.name;
    this.type = answer.type;
    this.class = answer.class;
    this.timeToLive = answer.timeToLive;
    this.dataLength = answer.dataLength;
  }

  toBuffer(): Buffer {
    const nameBuffer = Buffer.from(this.name, "utf-8");
    const buffer = Buffer.alloc(10 + nameBuffer.length);

    nameBuffer.copy(buffer, 0);
    buffer.writeUInt16BE(this.type, nameBuffer.length);
    buffer.writeUInt16BE(this.class, nameBuffer.length + 2);
    buffer.writeUInt32BE(this.timeToLive, nameBuffer.length + 4);
    buffer.writeUInt16BE(this.dataLength, nameBuffer.length + 8);

    return buffer;
  }
}

export class AnswerBuilder {
  private name: AnswerName;
  private type: AnswerType;
  private class_: AnswerClass;
  private timeToLive: AnswerTimeToLive;
  private dataLength: AnswerDataLength;

  constructor() {
    this.name = "";
    this.type = 1; // Default to A record
    this.class_ = 1; // Default to IN class
    this.timeToLive = 0; // Default to 0 seconds
    this.dataLength = 0; // Default to 0 bytes
  }

  withName(name: AnswerName): AnswerBuilder {
    this.name = name;
    return this;
  }

  withType(type: AnswerType): AnswerBuilder {
    this.type = type;
    return this;
  }

  withClass(class_: AnswerClass): AnswerBuilder {
    this.class_ = class_;
    return this;
  }

  withTimeToLive(timeToLive: AnswerTimeToLive): AnswerBuilder {
    this.timeToLive = timeToLive;
    return this;
  }

  withDataLength(dataLength: AnswerDataLength): AnswerBuilder {
    this.dataLength = dataLength;
    return this;
  }

  build(): Answer {
    return new Answer({
      name: this.name,
      type: this.type,
      class: this.class_,
      timeToLive: this.timeToLive,
      dataLength: this.dataLength,
    });
  }
}

export const answerBuilder = new AnswerBuilder();
