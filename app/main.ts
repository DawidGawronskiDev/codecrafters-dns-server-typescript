import * as dgram from "dgram";
import { Header, headerBuilder } from "./header";
import { questionBuilder, type Question } from "./question";
import { Extractor } from "./extractor";

const responseHeader: Header = headerBuilder
  .withPacketId(1234)
  .withQueryResponseIndicator(1)
  .withOperationCode(0)
  .withAuthorativeAnswer(0)
  .withTruncation(0)
  .withRecursionDesired(0)
  .withRecursionAvailable(0)
  .withReserved(0)
  .withResponseCode(0)
  .withQuestionCount(1)
  .withAnswerCount(0)
  .withAuthorityCount(0)
  .withAdditionalCount(0)
  .build();

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

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

    udpSocket.send(
      Buffer.concat([responseHeader.headerToBuffer(), question.toBuffer()]),
      remoteAddr.port,
      remoteAddr.address,
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
