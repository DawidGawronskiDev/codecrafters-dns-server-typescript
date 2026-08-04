import * as dgram from "dgram";
import { DNSHeader, dnsHeaderBuilder } from "./dns-header";
import { questionBuilder, type Question } from "./dns-question";

const responseHeader: DNSHeader = dnsHeaderBuilder
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

    const questionSectionNameHex: string =
      questionSectionNameBuffer.toString("hex");

    let index = 0;
    const labels: string[] = [];
    while (index < questionSectionNameHex.length) {
      const length: number = parseInt(
        questionSectionNameHex.slice(index, index + 2),
        16,
      );

      if (length === 0) {
        break;
      }

      const label: string = Buffer.from(
        questionSectionNameHex.slice(index + 2, index + 2 + length * 2),
        "hex",
      ).toString("utf-8");

      labels.push(label);
      index += 2 + length * 2;
    }

    const question: Question = questionBuilder
      .withName(labels.join("."))
      .withType(1)
      .withClass(1)
      .build();

    // const questionSectionTypeBuffer: Buffer = data.subarray(-4, -2);
    // const questionSectionClassBuffer: Buffer = data.subarray(-2);

    udpSocket.send(
      Buffer.concat([responseHeader.headerToBuffer(), question.toBuffer()]),
      remoteAddr.port,
      remoteAddr.address,
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
