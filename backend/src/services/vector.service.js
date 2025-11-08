// Import the Pinecone library
import { Pinecone } from '@pinecone-database/pinecone'

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Create a dense index with integrated embedding

const chatgptIndex = pc.index('chat-gpt');


async function createMemory({vector, metadata, messageId}) {
    await chatgptIndex.upsert([{
        id: messageId,
        values: vector,
        metadata
    }])

    
}


async function  queryMemory({queryVector,limit = 5, metadata}) {

    const data = await chatgptIndex.query(
        {
            vector: queryVector,
            topK: limit,
            filter: {
                metadata: metadata ? {metadata}:undefined
            
        },
        includeMetadata: true

        }
    
    );
    return data.matches
    
}

export {createMemory, queryMemory}