import * as dgram from "dgram";

type Header = {
  /**
   * Identifier assigned by the program that
   * generates any kind of query.  This identifier is copied
   * the corresponding reply and can be used by the requester
   * to match up replies to outstanding queries.
   *
   * @size 16 bits
   */
  packetId: number;
  /**
   * Specifies whether this message is a
   * query (0), or a response (1).
   *
   * @size 1 bit
   */
  queryResponseIndicator: 0 | 1;
  /**
   * A four bit field that specifies kind of query in this
   * message. This value is set by the originator of a query
   * and copied into the response.
   *
   * The values are:
   * 0 - a standard query (QUERY)
   * 1 - an inverse query (IQUERY)
   * 2 - a server status request (STATUS)
   * 3-15 - reserved for future use
   */
  operationCode:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15;
  /**
   * Specifies whether the responding server is an
   * authoritative server for the domain name in the query.
   *
   * @size 1 bit
   */
  authorativeAnswer: 0 | 1;
  /**
   * Specifies whether this message was truncated
   * due to length greater than that permitted on the
   * transmission channel.
   *
   * @size 1 bit
   */
  truncation: 0 | 1;
  /**
   * Specifies whether the client wants to use recursive query or not. If this bit is set, the
   * name server will pursue the query recursively. Recursive
   * query support is optional.
   *
   * @size 1 bit
   */
  recursionDesired: 0 | 1;
  /**
   * Specifies whether the name server supports recursive query or not. If this bit is set, the
   * name server supports recursive query. Recursive
   * query support is optional.
   *
   * @size 1 bit
   */
  recursionAvailable: 0 | 1;
  /**
   * Reserved for future use.  Must be zero in all queries and responses.
   *
   * @size 1 bit
   */
  reserved: 0;
  /**
   * Specifies the kind of response in this message.  This
   * value is set by the originator of a query and copied into the response.
   *
   * The values are:
   * 0 - No error condition
   * 1 - Format error - The name server was unable to interpret the query.
   * 2 - Server failure - The name server was unable to process this query due to a problem with the name server.
   * 3 - Name Error - Meaningful only for responses from an authoritative name server, this code signifies that the domain name referenced in the query does not exist.
   * 4 - Not Implemented - The name server does not support the requested kind of query.
   * 5 - Refused - The name server refuses to perform the specified operation for policy reasons. For example, a name server may not wish to provide the information to the particular requester, or a name server may not wish to perform a particular operation (e.g., zone transfer) for particular data.
   * 6-15 - Reserved for future use.
   *
   * @size 4 bits
   */
  responseCode:
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15;
  /**
   * Specifies the number of entries in the question section.
   *
   * @size 16 bits
   */
  questionCount: number;
  /**
   * Specifies the number of entries in the answer section.
   *
   * @size 16 bits
   */
  answerCount: number;
  /**
   * Specifies the number of entries in the authority records section.
   *
   * @size 16 bits
   */
  authorityCount: number;
  /**
   * Specifies the number of entries in the additional records section.
   *
   * @size 16 bits
   */
  additionalCount: number;
};

const responseHeader: Header = {
  packetId: 1234,
  queryResponseIndicator: 1,
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

const responseHeaderBuffer = Buffer.alloc(12);
responseHeaderBuffer.writeUInt16BE(responseHeader.packetId, 0);
responseHeaderBuffer.writeUInt8(
  responseHeader.queryResponseIndicator * 128 +
    responseHeader.operationCode * 8 +
    responseHeader.authorativeAnswer * 4 +
    responseHeader.truncation * 2 +
    responseHeader.recursionDesired,
  2,
);
responseHeaderBuffer.writeUInt8(
  responseHeader.recursionAvailable * 128 +
    responseHeader.reserved * 16 +
    responseHeader.responseCode,
  3,
);
responseHeaderBuffer.writeUInt16BE(responseHeader.questionCount, 4);
responseHeaderBuffer.writeUInt16BE(responseHeader.answerCount, 6);
responseHeaderBuffer.writeUInt16BE(responseHeader.authorityCount, 8);
responseHeaderBuffer.writeUInt16BE(responseHeader.additionalCount, 10);

console.log({ responseHeaderBuffer });

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  try {
    console.log(`Received data from ${remoteAddr.address}:${remoteAddr.port}`);
    const response = Buffer.from("");

    udpSocket.send(response, remoteAddr.port, remoteAddr.address);
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
