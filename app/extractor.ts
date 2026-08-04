export class Extractor {
  static extractLabelsFromQuestionSectionNameBuffer(
    nameBuffer: Buffer,
  ): string[] {
    const labels: Buffer[] = [];
    let cursor: number = 0;
    while (cursor < nameBuffer.length) {
      const length: number = nameBuffer.readUInt8(cursor);
      const label: Buffer = nameBuffer.subarray(
        cursor + 1,
        cursor + 1 + length,
      );

      if (length === 0) {
        break;
      }

      if (length > 0) {
        labels.push(label);
      }
      cursor += length + 1;
    }

    return labels.map((label) => label.toString("utf-8"));
  }
}
