import * as dgram from "dgram";
import { Header, headerBuilder } from "./header";
import { questionBuilder, type Question } from "./question";
import { Extractor } from "./extractor";
import { answerBuilder, type Answer } from "./answer";
import type { OperationCode, RecursionDesired } from "./types";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

const [flag, resolverSocket] = process.argv.slice(2);

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

    if (flag === "--resolver" && resolverSocket) {
      const resolverSocketInstance: dgram.Socket = dgram.createSocket("udp4");

      const [address, port] = resolverSocket.split(":");

      resolverSocketInstance.send(data, parseInt(port), address);

      resolverSocketInstance.on("message", (resolverData: Buffer) => {
        const packetId: number = resolverData.readUInt16BE(0);
        const operationCode: number = (resolverData.readUInt8(2) >> 3) & 0x0f;
        const recursionDesired: number = resolverData.readUInt8(2) & 0x01;
        const questionCount: number = resolverData.readUInt16BE(4);

        const responseHeader: Header = headerBuilder
          .withPacketId(packetId)
          .withQueryResponseIndicator(1)
          .withOperationCode(operationCode as OperationCode)
          .withAuthorativeAnswer(0)
          .withTruncation(0)
          .withRecursionDesired(recursionDesired as RecursionDesired)
          .withRecursionAvailable(0)
          .withReserved(0)
          .withResponseCode(0)
          .withQuestionCount(questionCount)
          .withAnswerCount(questionCount)
          .withAuthorityCount(0)
          .withAdditionalCount(0)
          .build();

        const questions: Question[] = [];
        const answers: Answer[] = [];
        let offset: number = 12;

        for (let i = 0; i < questionCount; i++) {
          const { labels, nextOffset } = Extractor.extractName(
            resolverData,
            offset,
          );
          const type = resolverData.readUInt16BE(nextOffset);
          const class_ = resolverData.readUInt16BE(nextOffset + 2);
          offset = nextOffset + 4;

          const question: Question = questionBuilder
            .withName(labels.join("."))
            .withType(type as Question["type"])
            .withClass(class_ as Question["class"])
            .build();
          questions.push(question);

          const { nextOffset: answerDataStart } = Extractor.extractName(
            resolverData,
            offset,
          );
          const rdlength = resolverData.readUInt16BE(answerDataStart + 8);
          const rdataOffset = answerDataStart + 10;

          answers.push(
            answerBuilder
              .withName(question.name)
              .withType(1)
              .withClass(1)
              .withTimeToLive(120)
              .withData(
                Buffer.from(
                  resolverData.subarray(rdataOffset, rdataOffset + rdlength),
                ),
              )
              .build(),
          );
          offset = rdataOffset + rdlength;
        }

        udpSocket.send(
          Buffer.concat([
            responseHeader.headerToBuffer(),
            ...questions.map((question) => question.toBuffer()),
            ...answers.map((answer) => answer.toBuffer()),
          ]),
          remoteAddr.port,
          remoteAddr.address,
        );
        resolverSocketInstance.close();
      });

      return;
    }

    const packetId: number = data.readUInt16BE(0);
    const operationCode: number = (data.readUInt8(2) >> 3) & 0x0f;
    const recursionDesired: number = data.readUInt8(2) & 0x01;
    const questionCount: number = data.readUInt16BE(4);

    const responseHeader: Header = headerBuilder
      .withPacketId(packetId)
      .withQueryResponseIndicator(1)
      .withOperationCode(operationCode as OperationCode)
      .withAuthorativeAnswer(0)
      .withTruncation(0)
      .withRecursionDesired(recursionDesired as RecursionDesired)
      .withRecursionAvailable(0)
      .withReserved(0)
      .withResponseCode(0)
      .withQuestionCount(questionCount)
      .withAnswerCount(questionCount)
      .withAuthorityCount(0)
      .withAdditionalCount(0)
      .build();

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
        responseHeader.headerToBuffer(),
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
