import type {
  DNSHeaderInterface,
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

export class DNSHeader implements DNSHeaderInterface {
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

  constructor(header: DNSHeaderInterface) {
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

export class DNSHeaderBuilder {
  private header: DNSHeaderInterface;

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

  withPacketId(packetId: PacketId): DNSHeaderBuilder {
    this.header.packetId = packetId;
    return this;
  }

  withQueryResponseIndicator(
    queryResponseIndicator: QueryResponseIndicator,
  ): DNSHeaderBuilder {
    this.header.queryResponseIndicator = queryResponseIndicator;
    return this;
  }

  withOperationCode(operationCode: OperationCode): DNSHeaderBuilder {
    this.header.operationCode = operationCode;
    return this;
  }

  withAuthorativeAnswer(
    authorativeAnswer: AuthorativeAnswer,
  ): DNSHeaderBuilder {
    this.header.authorativeAnswer = authorativeAnswer;
    return this;
  }

  withTruncation(truncation: Truncation): DNSHeaderBuilder {
    this.header.truncation = truncation;
    return this;
  }

  withRecursionDesired(recursionDesired: RecursionDesired): DNSHeaderBuilder {
    this.header.recursionDesired = recursionDesired;
    return this;
  }

  withRecursionAvailable(
    recursionAvailable: RecursionAvailable,
  ): DNSHeaderBuilder {
    this.header.recursionAvailable = recursionAvailable;
    return this;
  }

  withReserved(reserved: Reserved): DNSHeaderBuilder {
    this.header.reserved = reserved;
    return this;
  }

  withResponseCode(responseCode: ResponseCode): DNSHeaderBuilder {
    this.header.responseCode = responseCode;
    return this;
  }

  withQuestionCount(questionCount: QuestionCount): DNSHeaderBuilder {
    this.header.questionCount = questionCount;
    return this;
  }

  withAnswerCount(answerCount: AnswerCount): DNSHeaderBuilder {
    this.header.answerCount = answerCount;
    return this;
  }

  withAuthorityCount(authorityCount: AuthorityCount): DNSHeaderBuilder {
    this.header.authorityCount = authorityCount;
    return this;
  }

  withAdditionalCount(additionalCount: AdditionalCount): DNSHeaderBuilder {
    this.header.additionalCount = additionalCount;
    return this;
  }

  build(): DNSHeaderInterface {
    return this.header;
  }
}

export const dnsHeaderBuilder = new DNSHeaderBuilder();
