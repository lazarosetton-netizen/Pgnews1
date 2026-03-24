import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  timestamp: string;
  proIsraelPerspective: string;
}

export async function fetchLatestNews(): Promise<NewsItem[]> {
  const prompt = `
    Acesse as notícias mais recentes (últimas 24 horas) sobre Israel e o Oriente Médio nos seguintes sites:
    - https://www.timesofisrael.com/
    - https://www.ynet.co.il
    - https://www.c14.co.il/
    - https://www.i24news.tv/en
    - https://www.kan.org.il/
    - https://13tv.co.il/

    Para cada notícia relevante encontrada:
    1. Traduza o título para o português.
    2. Traduza o conteúdo principal para o português na íntegra (ou um resumo detalhado se for muito longo).
    3. Identifique a fonte original e a URL.
    4. Adicione uma seção chamada "Observação Geopolítica e Histórica" com foco pró-Israel, defendendo a soberania do Estado de Israel com base em lógica, dados, números e fatos históricos.

    Retorne os dados em formato JSON como uma lista de objetos com as seguintes propriedades:
    - id (string única)
    - title (string)
    - content (string, markdown permitido)
    - source (string)
    - url (string)
    - timestamp (ISO string)
    - proIsraelPerspective (string, markdown permitido)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              proIsraelPerspective: { type: Type.STRING },
            },
            required: ["id", "title", "content", "source", "url", "timestamp", "proIsraelPerspective"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    // Clean potential markdown blocks from the response
    const jsonContent = text.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}
