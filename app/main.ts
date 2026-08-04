import * as dgram from "dgram";
import { Header, headerBuilder } from "./header";
import { questionBuilder, type Question } from "./question";
import { Extractor } from "./extractor";
import { answerBuilder, type Answer } from "./answer";
import type { OperationCode, RecursionDesired } from "./types";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

const [flag, resolverAddress] = process.argv.slice(2);

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  if (flag === "--resolver" && resolverAddress) {
    const [resolverHost, resolverPort] = resolverAddress.split(":");

    const packetId: number = data.readUInt16BE(0);
    const operationCode: number = (data.readUInt8(2) >> 3) & 0x0f;
    const recursionDesired: number = data.readUInt8(2) & 0x01;
    const questionCount: number = data.readUInt16BE(4);

    const clientQuestions: Question[] = [];
    let offset: number = 12;
    for (let i = 0; i < questionCount; i++) {
      const { labels, nextOffset } = Extractor.extractName(data, offset);
      const type = data.readUInt16BE(nextOffset);
      const class_ = data.readUInt16BE(nextOffset + 2);
      offset = nextOffset + 4;

      clientQuestions.push(
        questionBuilder
          .withName(labels.join("."))
          .withType(type as Question["type"])
          .withClass(class_ as Question["class"])
          .build(),
      );
    }

    const answers: Answer[] = [];
    let pending = questionCount;

    const sendMergedResponse = () => {
      pending -= 1;
      if (pending > 0) return;

      const responseHeader: Header = headerBuilder
        .withPacketId(packetId)
        .withQueryResponseIndicator(1)
        .withOperationCode(operationCode as OperationCode)
        .withAuthorativeAnswer(0)
        .withTruncation(0)
        .withRecursionDesired(recursionDesired as RecursionDesired)
        .withRecursionAvailable(0)
        .withReserved(0)
        .withResponseCode(operationCode === 0 ? 0 : 4)
        .withQuestionCount(questionCount)
        .withAnswerCount(answers.length)
        .withAuthorityCount(0)
        .withAdditionalCount(0)
        .build();

      udpSocket.send(
        Buffer.concat([
          responseHeader.headerToBuffer(),
          ...clientQuestions.map((q) => q.toBuffer()),
          ...answers.map((a) => a.toBuffer()),
        ]),
        remoteAddr.port,
        remoteAddr.address,
      );
    };

    clientQuestions.forEach((question) => {
      const flattenedHeader: Header = headerBuilder
        .withPacketId(packetId)
        .withQueryResponseIndicator(0)
        .withOperationCode(operationCode as OperationCode)
        .withAuthorativeAnswer(0)
        .withTruncation(0)
        .withRecursionDesired(recursionDesired as RecursionDesired)
        .withRecursionAvailable(0)
        .withReserved(0)
        .withResponseCode(0)
        .withQuestionCount(1)
        .withAnswerCount(0)
        .withAuthorityCount(0)
        .withAdditionalCount(0)
        .build();

      const resolverSocket: dgram.Socket = dgram.createSocket("udp4");
      resolverSocket.send(
        Buffer.concat([flattenedHeader.headerToBuffer(), question.toBuffer()]),
        parseInt(resolverPort),
        resolverHost,
      );

      resolverSocket.on("message", (responseData: Buffer) => {
        try {
          const { nextOffset: questionEnd } = Extractor.extractName(
            responseData,
            12,
          );
          const { nextOffset: answerNameEnd } = Extractor.extractName(
            responseData,
            questionEnd + 4,
          );
          const rdlength = responseData.readUInt16BE(answerNameEnd + 8);
          const rdataOffset = answerNameEnd + 10;

          answers.push(
            answerBuilder
              .withName(question.name)
              .withType(1)
              .withClass(1)
              .withTimeToLive(120)
              .withData(
                Buffer.from(
                  responseData.subarray(rdataOffset, rdataOffset + rdlength),
                ),
              )
              .build(),
          );
        } catch (e) {
          console.log(`Error handling resolver response: ${e}`);
        } finally {
          resolverSocket.close();
          sendMergedResponse();
        }
      });
    });

    return;
  }

  try {
    const packetId: number = data.readUInt16BE(0);
    const operationCode: number = (data.readUInt8(2) >> 3) & 0x0f;
    const recursionDesired: number = data.readUInt8(2) & 0x01;
    const questionCount: number = data.readUInt16BE(4);

    const response = Buffer.alloc(12);
    response.writeUInt16BE(packetId, 0);
    response.writeUInt8(0x80 | (operationCode << 3) | recursionDesired, 2);
    response.writeUInt16BE(questionCount, 4);
    response.writeUInt16BE(questionCount, 6); // Answer count
    response.writeUInt16BE(0, 8); // Authority count
    response.writeUInt16BE(0, 10); // Additional count

    const questions: Question[] = [];
    const answers: Answer[] = [];
    let offset: number = 12;

    for (let i = 0; i < questionCount; i++) {
      const { labels, nextOffset } = Extractor.extractName(data, offset);
      const type = data.readUInt16BE(nextOffset);
      const class_ = data.readUInt16BE(nextOffset + 2);
      offset = nextOffset + 4;

      const question: Question = questionBuilder
        .withName(labels.join("."))
        .withType(type as Question["type"])
        .withClass(class_ as Question["class"])
        .build();
      questions.push(question);

      answers.push(
        answerBuilder
          .withName(question.name)
          .withType(1)
          .withClass(1)
          .withTimeToLive(120)
          .withData(Buffer.from([8, 8, 8, 8]))
          .build(),
      );
    }

    udpSocket.send(
      Buffer.concat([
        response,
        ...questions.map((question) => question.toBuffer()),
        ...answers.map((answer) => answer.toBuffer()),
      ]),
      remoteAddr.port,
      remoteAddr.address,
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
