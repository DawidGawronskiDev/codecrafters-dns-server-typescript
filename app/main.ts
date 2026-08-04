import * as dgram from "dgram";

const udpSocket: dgram.Socket = dgram.createSocket("udp4");
udpSocket.bind(2053, "127.0.0.1");

const [flag, resolverAddress] = process.argv.slice(2);
console.log({ flag, resolverAddress });

if (flag === "--resolver" && resolverAddress) {
  const [resolverHost, resolverPort] = resolverAddress.split(":");

  udpSocket.on("message", (data: Buffer, remoteAddr: dgram.RemoteInfo) => {
    console.log(
      `Forwarding query from ${remoteAddr.address}:${remoteAddr.port}`,
    );

    const resolverSocket: dgram.Socket = dgram.createSocket("udp4");

    const headerSectionBuffer = data.subarray(0, 12);
    const questionSectionBuffer = data.subarray(12);

    let cursor = 0;
    while (cursor < questionSectionBuffer.length) {
      const length = questionSectionBuffer[cursor];
      const label = questionSectionBuffer.subarray(
        cursor + 1,
        cursor + 1 + length,
      );

      console.log({ length, label: label.toString("utf-8") });

      if (length === 0) {
        break;
      }

      cursor += length + 1;
    }

    resolverSocket.send(
      Buffer.concat([headerSectionBuffer]),
      parseInt(resolverPort),
      resolverHost,
      (err) => {
        if (err) {
          console.error(`Error sending data to resolver: ${err}`);
        }
      },
    );

    resolverSocket.on("message", (responseData: Buffer) => {
      console.log(
        `Received response from resolver: ${responseData.toString("hex")}`,
      );

      udpSocket.send(
        responseData,
        remoteAddr.port,
        remoteAddr.address,
        (err) => {
          if (err) {
            console.error(`Error sending data back to client: ${err}`);
          }
        },
      );

      resolverSocket.close();
    });
  });
}
