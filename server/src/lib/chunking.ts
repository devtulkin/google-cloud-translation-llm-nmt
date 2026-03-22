function splitByParagraph(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitBySentence(text: string): string[] {
  const matches = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  return (matches ?? [text]).map((part) => part.trim()).filter(Boolean);
}

function hardSplit(text: string, size: number): string[] {
  const chunks: string[] = [];

  for (let index = 0; index < text.length; index += size) {
    chunks.push(text.slice(index, index + size));
  }

  return chunks;
}

function chunkSegment(segment: string, size: number): string[] {
  if (segment.length <= size) {
    return [segment];
  }

  const sentenceChunks = splitBySentence(segment);
  if (sentenceChunks.every((sentence) => sentence.length <= size)) {
    return sentenceChunks;
  }

  return sentenceChunks.flatMap((sentence) => {
    if (sentence.length <= size) {
      return [sentence];
    }

    return hardSplit(sentence, size);
  });
}

export function chunkText(text: string, size: number): string[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.length <= size) {
    return [trimmed];
  }

  const paragraphs = splitByParagraph(trimmed);
  if (paragraphs.length > 1) {
    return paragraphs.flatMap((paragraph) => chunkSegment(paragraph, size));
  }

  return chunkSegment(trimmed, size);
}
