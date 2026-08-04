import type {
  AnswerClass,
  AnswerData,
  AnswerInterface,
  AnswerName,
  AnswerTimeToLive,
  AnswerType,
} from "./types";
import { encodeName } from "./question";

export class Answer implements AnswerInterface {
  name: AnswerName;
  type: AnswerType;
  class: AnswerClass;
  timeToLive: AnswerTimeToLive;
  data: Buffer;

  constructor(answer: AnswerInterface) {
    this.name = answer.name;
    this.type = answer.type;
    this.class = answer.class;
    this.timeToLive = answer.timeToLive;
    this.data = answer.data;
  }

  toBuffer(): Buffer {
    const nameBuffer = encodeName(this.name);
    const buffer = Buffer.alloc(10 + nameBuffer.length);

    nameBuffer.copy(buffer, 0);
    buffer.writeUInt16BE(this.type, nameBuffer.length);
    buffer.writeUInt16BE(this.class, nameBuffer.length + 2);
    buffer.writeUInt32BE(this.timeToLive, nameBuffer.length + 4);
    buffer.writeUInt16BE(this.data.length, nameBuffer.length + 8);

    return Buffer.concat([buffer, this.data]);
  }
}

export class AnswerBuilder {
  private name: AnswerName;
  private type: AnswerType;
  private class_: AnswerClass;
  private timeToLive: AnswerTimeToLive;
  private data: AnswerData;

  constructor() {
    this.name = "";
    this.type = 1; // Default to A record
    this.class_ = 1; // Default to IN class
    this.timeToLive = 0; // Default to 0 seconds
    this.data = Buffer.alloc(0);
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

  withData(data: AnswerData): AnswerBuilder {
    this.data = data;
    return this;
  }

  build(): Answer {
    return new Answer({
      name: this.name,
      type: this.type,
      class: this.class_,
      timeToLive: this.timeToLive,
      data: this.data,
    });
  }
}

export const answerBuilder = new AnswerBuilder();
