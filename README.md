**🚀 AI-Powered RAG Portfolio**
-------------------------------

An interactive, AI-driven **resume & portfolio assistant** that lets recruiters and hiring managers **ask questions about Kyle Holloway's skills, experience, and projects**.

### **🔹 Tech Stack**

-   **Frontend:** Next.js (React + TailwindCSS)
-   **Backend:** API routes (`/api/chat`) powered by OpenAI
-   **Database:** PostgreSQL with `pgvector` for similarity search
-   **Hosting:** Vercel (for Next.js) + Neon DB (PostgreSQL)
-   **AI Model:** OpenAI (`text-embedding-ada-002` for vector search, `gpt-3.5-turbo` for response generation)

* * * * *

**🔥 Features**
---------------

✅ **AI-Powered Chat:** Ask Kyle's AI assistant about his **skills, experience, and projects**\
✅ **Vector Search (RAG):** Retrieves **relevant resume data** from PostgreSQL using `pgvector`\
✅ **Instant API Response:** Seamlessly integrates **OpenAI embeddings + vector retrieval**\
✅ **Fast & Scalable:** Hosted on **Vercel**, using **Neon DB** for efficient query execution\
✅ **Optimized for Hiring:** Recruiters can ask **specific technical and leadership questions**

* * * * *

**🚀 System Architecture**
--------------------------

1️⃣ **User enters a question in the chat.**\
2️⃣ **API (`/api/chat`) sends the prompt to OpenAI's embedding model (`text-embedding-ada-002`).**\
3️⃣ **The system retrieves relevant records from PostgreSQL (`pgvector` similarity search).**\
4️⃣ **The retrieved content is sent to OpenAI (`gpt-3.5-turbo`) for a structured response.**\
5️⃣ **The AI-generated response is displayed on the UI.**

* * * * *

**🛠 Setup & Installation**
---------------------------

### **1️⃣ Clone the Repository**

bash

CopyEdit

`git clone https://github.com/your-repo/ai-rag-portfolio.git
cd ai-rag-portfolio`

### **2️⃣ Install Dependencies**

bash

CopyEdit

`pnpm install`

### **3️⃣ Configure Environment Variables (`.env`)**

Create a `.env` file with the following:

env

CopyEdit

`DATABASE_URL="postgresql://your-db-user:your-db-password@your-db-host/your-db-name"
OPENAI_API_KEY="your-openai-api-key"`

### **4️⃣ Initialize the Database**

Run migrations to set up the **PostgreSQL schema**:

bash

CopyEdit

`pnpm exec prisma migrate dev --name init`

Seed the database:

bash

CopyEdit

`pnpm run prisma:seed`

### **5️⃣ Start the Development Server**

bash

CopyEdit

`pnpm run dev`

Open **<http://localhost:3000>** in your browser.

* * * * *

**🧠 Key Components**
---------------------

### **📂 Frontend (`index.tsx`)**

The **chat interface** where users enter queries:

-   **Sends requests** to `/api/chat`
-   **Displays AI responses**
-   **Handles loading & errors gracefully**

### **📂 API (`/api/chat.ts`)**

The backend logic for **retrieval-augmented generation (RAG)**:

-   **Generates OpenAI embeddings** for the query
-   **Performs a similarity search** on `pgvector`
-   **Formats retrieved data into structured context**
-   **Generates a response using `gpt-3.5-turbo`**

### **📂 Database (`PostgreSQL + pgvector`)**

Stores **structured resume data**:

-   **Embedding column (`vector(1536)`)** allows **fast AI similarity searches**
-   **Indexing improves performance** (IVFFLAT recommended)

* * * * *

**🔥 Debugging & Common Fixes**
-------------------------------

### **1️⃣ PostgreSQL Type Mismatch (`vector <-> numeric[]`)**

✅ **Fix:** Ensure correct casting in query:

ts

CopyEdit

`results = await prisma.$queryRawUnsafe(
  `SELECT title, content FROM "KnowledgeBase" WHERE embedding IS NOT NULL ORDER BY embedding <-> CAST($1 AS vector) LIMIT 3`,
  embedding
);`

### **2️⃣ Prisma Query Parameter Error (`Expected: 1, actual: 0`)**

✅ **Fix:** Pass `embedding` **directly** instead of as an array:

ts

CopyEdit

`embedding // ✅ Correct
[embedding] // ❌ Incorrect`

### **3️⃣ No Results Found in Vector Search**

✅ **Fix:** Ensure database is **seeded with embeddings**:

bash

CopyEdit

`pnpm run prisma:seed`

Run SQL to check stored vectors:

sql

CopyEdit

`SELECT * FROM "KnowledgeBase" LIMIT 5;`

### **4️⃣ OpenAI Embedding Returns `null`**

✅ **Fix:** Log the response:

ts

CopyEdit

`console.log("🧠 OpenAI Embedding Response:", JSON.stringify(embeddingResponse, null, 2));`

If empty, check **API key** or **OpenAI API status**.

* * * * *

**🚀 Deployment Guide**
-----------------------

### **1️⃣ Deploy Next.js Frontend to Vercel**

bash

CopyEdit

`pnpm run build
pnpm run start`

Connect to **Vercel** for hosting.

### **2️⃣ Deploy PostgreSQL (`pgvector`) on Neon DB**

Use **Neon DB** for **managed, scalable Postgres with `pgvector` support**.\
Modify `DATABASE_URL` in `.env` with your **Neon DB credentials**.

### **3️⃣ Add Database Indexing for Performance**

sql

CopyEdit

`CREATE INDEX knowledgebase_embedding_idx ON "KnowledgeBase" USING ivfflat (embedding);`

This speeds up **vector similarity searches**.

* * * * *

**💡 Future Enhancements**
--------------------------

✔ **🎨 Improve UI:** Add **message history, avatars, and animations**\
✔ **📊 Advanced RAG Search:** Use **hybrid search** (vector + keyword search)\
✔ **🔍 Better Model Selection:** Experiment with **GPT-4, Claude, or Mistral**\
✔ **📂 File Uploads:** Let users **upload resumes** for **AI-powered search**