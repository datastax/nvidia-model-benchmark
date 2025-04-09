import { encode, decode } from "gpt-tokenizer";
import * as https from "https";
import * as cheerio from "cheerio";

/**
 * Fetches content from a URL
 * @param url The URL to fetch content from
 * @returns A promise that resolves to the content as a string
 */
async function fetchContent(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch content: ${response.statusCode}`));
          return;
        }

        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Splits text into chunks of approximately the specified token count
 * Using the gpt-tokenizer library
 * @param text The text to split into chunks
 * @param tokensPerChunk The approximate number of tokens per chunk
 * @returns An array of text chunks
 */
function createChunks(text: string, tokensPerChunk: number): string[] {
  // 1. Encode the whole text to get an array of tokens
  const tokens = encode(text);

  // 2. Split the array based on number of tokens
  const chunks: number[][] = [];
  for (let i = 0; i < tokens.length; i += tokensPerChunk) {
    chunks.push(tokens.slice(i, i + tokensPerChunk));
  }

  // 3. Decode each sub-array to the original text and use the result as a chunk
  return chunks.map((chunk) => decode(chunk));
}

/**
 * Extracts text content from HTML
 * @param html The HTML content to extract text from
 * @returns The extracted text content with cleaned whitespace
 */
function extractTextFromHtml(html: string): string {
  // Load HTML into cheerio
  const $ = cheerio.load(html);

  // Remove script and style elements that don't contain readable content
  $("script, style").remove();

  // Get text content with newlines between elements
  const text = $("body").text().replace(/\s+/g, " ").trim();

  // Clean up whitespace - remove extra spaces and empty lines
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Fetches content from a URL and splits it into chunks
 * Using the gpt-tokenizer library
 * @param url The URL to fetch content from
 * @param tokensPerChunk The approximate number of tokens per chunk
 * @returns A promise that resolves to an array of text chunks
 */
export async function getChunksFromUrl(
  url: string,
  tokensPerChunk: number,
): Promise<string[]> {
  try {
    const htmlContent = await fetchContent(url);
    const textContent = extractTextFromHtml(htmlContent);
    return createChunks(textContent, tokensPerChunk);
  } catch (error) {
    console.error("Error fetching or processing content:", error);
    throw error;
  }
}

/**
 * Example usage:
 *
 * import { getChunksFromUrl } from './chunks';
 *
 * async function main() {
 *   try {
 *     const url = 'https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/';
 *     const chunks = await getChunksFromUrl(url, 100); // Get chunks of ~100 tokens each
 *
 *     console.log(`Split content into ${chunks.length} chunks`);
 *     chunks.forEach((chunk, index) => {
 *       console.log(`\nChunk ${index + 1}:`);
 */
