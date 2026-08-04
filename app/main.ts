import * as dgram from "dgram";
import { Header, headerBuilder } from "./header";
import { questionBuilder, type Question } from "./question";
import { Extractor } from "./extractor";
import { answerBuilder, type Answer } from "./answer";
import type { OperationCode, RecursionDesired } from "./types";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

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
      .withResponseCode(4)
      .withQuestionCount(questionCount)
      .withAnswerCount(1)
      .withAuthorityCount(1)
      .withAdditionalCount(1)
      .build();

    const hex = data.toString("hex");

    const binary = hex
      .split("")
      .map((char) => parseInt(char, 16).toString(2).padStart(4, "0"))
      .join("");

    console.log({ binary });

    const questionSectionNameBuffer: Buffer = data.subarray(12);

    const question: Question = questionBuilder
      .withName(
        Extractor.extractLabelsFromQuestionSectionNameBuffer(
          questionSectionNameBuffer,
        ).join("."),
      )
      .withType(1)
      .withClass(1)
      .build();

    const answer: Answer = answerBuilder
      .withName(question.name)
      .withType(1)
      .withClass(1)
      .withTimeToLive(120)
      .withData(Buffer.from([8, 8, 8, 8]))
      .build();

    udpSocket.send(
      Buffer.concat([
        responseHeader.headerToBuffer(),
        question.toBuffer(),
        answer.toBuffer(),
      ]),
      remoteAddr.port,
      remoteAddr.address,
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
