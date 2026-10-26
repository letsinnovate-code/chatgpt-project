// Import the Pinecone library
import { Pinecone } from '@pinecone-database/pinecone'

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding
const indexName = process.env.PINECONE_INDEX || 'chat-gpt';
const chatgptIndex = pc.index(indexName);

async function createMemory({vector, metadata, messageId}) {
    try {
        await chatgptIndex.upsert([{
            id: messageId?.toString() || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            values: vector,
            metadata: metadata || {}
        }]);
    } catch (error) {
        console.error("Pinecone createMemory error:", error.message);
    }
}

async function queryMemory({queryVector, limit = 5, metadata}) {
    try {
        const queryOptions = {
            vector: queryVector,
            topK: limit,
            includeMetadata: true
        };

        if (metadata && Object.keys(metadata).length > 0) {
            queryOptions.filter = metadata;
        }

        const data = await chatgptIndex.query(queryOptions);
        return data?.matches || [];
    } catch (error) {
        console.error("Pinecone queryMemory error:", error.message);
        return [];
    }
}

export { createMemory, queryMemory }