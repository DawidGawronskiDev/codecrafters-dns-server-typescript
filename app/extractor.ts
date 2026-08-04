export class Extractor {
  /**
   * Parses a domain name starting at `offset` within the full packet,
   * following compression pointers (RFC 1035 4.1.4) as needed.
   * `nextOffset` is where parsing should resume after this name in the
   * original location, even when a pointer was followed.
   */
  static extractName(
    packet: Buffer,
    offset: number,
  ): { labels: string[]; nextOffset: number } {
    const labels: string[] = [];
    let cursor: number = offset;
    let resumeOffset: number = -1;

    while (true) {
      const length: number = packet.readUInt8(cursor);

      if (length === 0) {
        cursor += 1;
        if (resumeOffset === -1) resumeOffset = cursor;
        break;
      }

      if ((length & 0xc0) === 0xc0) {
        const pointer: number =
          ((length & 0x3f) << 8) | packet.readUInt8(cursor + 1);
        if (resumeOffset === -1) resumeOffset = cursor + 2;
        cursor = pointer;
        continue;
      }

      labels.push(
        packet.subarray(cursor + 1, cursor + 1 + length).toString("utf-8"),
      );
      cursor += length + 1;
    }

    return { labels, nextOffset: resumeOffset };
  }
}
