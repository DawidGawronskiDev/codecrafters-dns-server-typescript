import * as dgram from "dgram";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

const [flag, argument] = process.argv.slice(2);

function parseNames(requestBuffer: Buffer): Buffer[] {
  const names: Buffer[] = [];

  let cursor = 12;
  while (cursor < requestBuffer.length) {
    const labels: Buffer[] = [];
    let readCursor = cursor;
    let jumped = false;
    let bytesConsumed = 0;

    while (true) {
      const lengthByte = requestBuffer[readCursor];

      if (lengthByte === 0x00) {
        if (!jumped) bytesConsumed += 1;
        break;
      }

      if ((lengthByte & 0xc0) === 0xc0) {
        // Compression pointer
        const pointer =
          ((lengthByte & 0x3f) << 8) | requestBuffer[readCursor + 1];
        if (!jumped) bytesConsumed += 2;
        readCursor = pointer;
        jumped = true;
        continue;
      }

      labels.push(
        requestBuffer.subarray(readCursor, readCursor + 1 + lengthByte),
      );
      if (!jumped) bytesConsumed += 1 + lengthByte;
      readCursor += 1 + lengthByte;
    }

    names.push(Buffer.concat([...labels, Buffer.from([0x00])]));
    cursor += bytesConsumed + 4; // name + QTYPE + QCLASS
  }

  return names;
}

function createQuestionBuffer(name: Buffer): Buffer {
  return Buffer.concat([
    name,
    Buffer.from([0x00, 0x01]), // QTYPE = 0x0001 (A record)
    Buffer.from([0x00, 0x01]), // QCLASS = 0x0001 (IN)
  ]);
}

function createAnswerBuffer(name: Buffer): Buffer {
  return Buffer.concat([
    name,
    Buffer.from([0x00, 0x01]), // TYPE = A
    Buffer.from([0x00, 0x01]), // CLASS = IN
    Buffer.from([0x00, 0x00, 0x00, 0x3c]), // TTL = 60
    Buffer.from([0x00, 0x04]), // RDLENGTH = 4
    Buffer.from([8, 8, 8, 8]), // RDATA = 8.8.8.8
  ]);
}

function queryResolver(
  id: Buffer,
  questionBuffer: Buffer,
  hostname: string,
  port: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const resolver = dgram.createSocket("udp4");

    resolver.send(
      Buffer.concat([
        Buffer.from([
          ...id,
          0x00, // QR = 0, OPCODE = 0, AA = 0, TC = 0, RD = 0
          0x00, // RA = 0, Z = 0, RCODE = 0
          0x00,
          0x01, // QDCOUNT = 1
          0x00,
          0x00, // ANCOUNT = 0
          0x00,
          0x00, // NSCOUNT = 0
          0x00,
          0x00, // ARCOUNT = 0
        ]),
        questionBuffer,
      ]),
      port,
      hostname,
    );

    resolver.on("message", (resolverData: Buffer) => {
      resolver.close();
      resolve(resolverData.subarray(12 + questionBuffer.length));
    });

    resolver.on("error", (err) => {
      resolver.close();
      reject(err);
    });
  });
}

udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
  const opcode = (data[2] >> 3) & 0x0f;

  const names = parseNames(data);
  const questionBuffers = names.map(createQuestionBuffer);
  const answerBuffers = names.map(createAnswerBuffer);

  try {
    if (flag === "--resolver" && argument) {
      const [hostname, port] = argument.split(":");
      const id = data.subarray(0, 2);

      Promise.all(
        questionBuffers.map((questionBuffer) =>
          queryResolver(id, questionBuffer, hostname, parseInt(port)),
        ),
      )
        .then((resolvedAnswers) => {
          udpSocket.send(
            Buffer.concat([
              /**
               * Header Section
               */
              Buffer.from([
                ...id,
                0x80 | // QR = 1
                  (data.subarray(2, 4)[0] & 0x78) | // OPCODE
                  (data.subarray(2, 4)[0] & 0x01), // RD
                opcode === 0 ? 0x00 : 0x04, // RA = 0, Z = 0, RCODE = 0 | 4
                0x00,
                questionBuffers.length, // QDCOUNT
                0x00,
                resolvedAnswers.length, // ANCOUNT
                0x00,
                0x00, // NSCOUNT = 0
                0x00,
                0x00, // ARCOUNT = 0
              ]),
              /**
               * Question Section
               */
              Buffer.concat(questionBuffers),
              /**
               * Answer Section
               */
              Buffer.concat(resolvedAnswers),
            ]),
            remoteAddr.port,
            remoteAddr.address,
          );
        })
        .catch((err) => {
          console.log(`Resolver error: ${err}`);
        });

      return;
    }

    udpSocket.send(
      Buffer.concat([
        /**
         * Header Section
         */
        Buffer.from([
          ...data.subarray(0, 2), // ID
          0x80 | // QR = 1
            (data.subarray(2, 4)[0] & 0x78) | // OPCODE
            (data.subarray(2, 4)[0] & 0x01), // RD
          opcode === 0 ? 0x00 : 0x04, // RA = 0, Z = 0, RCODE = 0 | 4
          0x00,
          questionBuffers.length, // QDCOUNT
          0x00,
          questionBuffers.length, // ANCOUNT
          0x00,
          0x00, // NSCOUNT = 0
          0x00,
          0x00, // ARCOUNT = 0
        ]),
        /**
         * Question Section
         */
        Buffer.concat(questionBuffers),
        /**
         * Answer Section
         */
        Buffer.concat(answerBuffers),
      ]),
      remoteAddr.port,
      remoteAddr.address,
    );
  } catch (e) {
    console.log(`Error sending data: ${e}`);
  }
});
