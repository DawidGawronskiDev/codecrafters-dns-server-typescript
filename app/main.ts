import * as dgram from "dgram";
import { DNSHeader, dnsHeaderBuilder } from "./dns-header";

function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
}

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
  .withQuestionCount(0)
  .withAnswerCount(0)
  .withAuthorityCount(0)
  .withAdditionalCount(0)
  .build();

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);

    const questionSectionBuffer = data.subarray(12, -1);
    const questionSectionHex = questionSectionBuffer.toString("hex");

    let index = 0;
    const length = parseInt(questionSectionHex.slice(index, index + 2), 16);
    console.log({ length });

    udpSocket.send(
      responseHeader.headerToBuffer(),
      remoteAddr.port,
      remoteAddr.address,
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
