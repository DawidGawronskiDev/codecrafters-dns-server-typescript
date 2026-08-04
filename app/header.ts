import type {
  HeaderInterface,
  PacketId,
  QueryResponseIndicator,
  OperationCode,
  AuthorativeAnswer,
  Truncation,
  RecursionDesired,
  RecursionAvailable,
  Reserved,
  ResponseCode,
  QuestionCount,
  AnswerCount,
  AuthorityCount,
  AdditionalCount,
} from "./types";

export class Header implements HeaderInterface {
  packetId: PacketId;
  queryResponseIndicator: QueryResponseIndicator;
  operationCode: OperationCode;
  authorativeAnswer: AuthorativeAnswer;
  truncation: Truncation;
  recursionDesired: RecursionDesired;
  recursionAvailable: RecursionAvailable;
  reserved: Reserved;
  responseCode: ResponseCode;
  questionCount: QuestionCount;
  answerCount: AnswerCount;
  authorityCount: AuthorityCount;
  additionalCount: AdditionalCount;

  constructor(header: HeaderInterface) {
    this.packetId = header.packetId;
    this.queryResponseIndicator = header.queryResponseIndicator;
    this.operationCode = header.operationCode;
    this.authorativeAnswer = header.authorativeAnswer;
    this.truncation = header.truncation;
    this.recursionDesired = header.recursionDesired;
    this.recursionAvailable = header.recursionAvailable;
    this.reserved = header.reserved;
    this.responseCode = header.responseCode;
    this.questionCount = header.questionCount;
    this.answerCount = header.answerCount;
    this.authorityCount = header.authorityCount;
    this.additionalCount = header.additionalCount;
  }

  headerToBuffer(): Buffer {
    const buffer: Buffer = Buffer.alloc(12);

    buffer.writeUInt16BE(this.packetId, 0);

    buffer.writeUInt8(
      (this.queryResponseIndicator << 7) |
        (this.operationCode << 3) |
        (this.authorativeAnswer << 2) |
        (this.truncation << 1) |
        this.recursionDesired,
      2,
    );

    buffer.writeUInt8(
      (this.recursionAvailable << 7) | (this.reserved << 4) | this.responseCode,
      3,
    );

    buffer.writeUInt16BE(this.questionCount, 4);
    buffer.writeUInt16BE(this.answerCount, 6);
    buffer.writeUInt16BE(this.authorityCount, 8);
    buffer.writeUInt16BE(this.additionalCount, 10);

    return buffer;
  }
}

export class HeaderBuilder {
  private header: HeaderInterface;

  constructor() {
    this.header = {
      packetId: 0,
      queryResponseIndicator: 0,
      operationCode: 0,
      authorativeAnswer: 0,
      truncation: 0,
      recursionDesired: 0,
      recursionAvailable: 0,
      reserved: 0,
      responseCode: 0,
      questionCount: 0,
      answerCount: 0,
      authorityCount: 0,
      additionalCount: 0,
    };
  }

  withPacketId(packetId: PacketId): HeaderBuilder {
    this.header.packetId = packetId;
    return this;
  }

  withQueryResponseIndicator(
    queryResponseIndicator: QueryResponseIndicator,
  ): HeaderBuilder {
    this.header.queryResponseIndicator = queryResponseIndicator;
    return this;
  }

  withOperationCode(operationCode: OperationCode): HeaderBuilder {
    this.header.operationCode = operationCode;
    return this;
  }

  withAuthorativeAnswer(authorativeAnswer: AuthorativeAnswer): HeaderBuilder {
    this.header.authorativeAnswer = authorativeAnswer;
    return this;
  }

  withTruncation(truncation: Truncation): HeaderBuilder {
    this.header.truncation = truncation;
    return this;
  }

  withRecursionDesired(recursionDesired: RecursionDesired): HeaderBuilder {
    this.header.recursionDesired = recursionDesired;
    return this;
  }

  withRecursionAvailable(
    recursionAvailable: RecursionAvailable,
  ): HeaderBuilder {
    this.header.recursionAvailable = recursionAvailable;
    return this;
  }

  withReserved(reserved: Reserved): HeaderBuilder {
    this.header.reserved = reserved;
    return this;
  }

  withResponseCode(responseCode: ResponseCode): HeaderBuilder {
    this.header.responseCode = responseCode;
    return this;
  }

  withQuestionCount(questionCount: QuestionCount): HeaderBuilder {
    this.header.questionCount = questionCount;
    return this;
  }

  withAnswerCount(answerCount: AnswerCount): HeaderBuilder {
    this.header.answerCount = answerCount;
    return this;
  }

  withAuthorityCount(authorityCount: AuthorityCount): HeaderBuilder {
    this.header.authorityCount = authorityCount;
    return this;
  }

  withAdditionalCount(additionalCount: AdditionalCount): HeaderBuilder {
    this.header.additionalCount = additionalCount;
    return this;
  }

  build(): Header {
    return new Header(this.header);
  }
}

export const headerBuilder = new HeaderBuilder();
