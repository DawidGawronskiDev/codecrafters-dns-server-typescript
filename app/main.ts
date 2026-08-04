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

    resolverSocket.send(data, parseInt(resolverPort), resolverHost, (err) => {
      if (err) {
        console.error(`Error sending data to resolver: ${err}`);
      }
    });

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
