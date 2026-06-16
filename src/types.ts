export interface ExtractedSource {
  url: string;
  type: string;
  domain: string;
  context: string;
}

export interface ExtractionResponse {
  sources?: string[];
  extracted?: ExtractedSource[];
  error?: string;
}

