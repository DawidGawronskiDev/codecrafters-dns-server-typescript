export class Extractor {
  static extractLabelsFromQuestionSectionNameBuffer(
    nameBuffer: Buffer,
  ): string[] {
    const labels: string[] = [];
    let index = 0;

    while (index < nameBuffer.length) {
      const length = nameBuffer.readUInt8(index);
      if (length === 0) {
        break;
      }
      const label = nameBuffer
        .subarray(index + 1, index + 1 + length)
        .toString("utf-8");
      labels.push(label);
      index += 1 + length;
    }

    return labels;
  }
}
