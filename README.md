**AI-Powered RAG Portfolio**
============================

An **interactive AI-powered portfolio** that delivers instant insights into **Kyle Holloway's** work, leadership, and expertise using **Retrieval-Augmented Generation (RAG)**. This project integrates **Next.js, Payload CMS, OpenAI, and Drizzle ORM** with a **dedicated vector database** for AI-driven responses.

**🚀 Features**
---------------

-   **AI Chat Interface** -- Users interact with an AI assistant that retrieves structured information about Kyle's career.
-   **RAG-based Search** -- Uses OpenAI embeddings and vector search to dynamically retrieve relevant content.
-   **Payload CMS Integration** -- Content such as work experience, projects, and skills are managed via Payload.
-   **Dual Neon Databases** -- One **Neon DB for Payload CMS**, and another **isolated Neon DB for vector embeddings**.
-   **React Modules & SCSS** -- Styling is handled using **React modules and SCSS**, ensuring a maintainable and modular UI.
-   **Optimized for Production** -- Deployed on **Vercel** with **auto-scaling** and **high availability**.

* * * * *

**📂 Tech Stack**
-----------------

| **Technology** | **Purpose** |
| --- | --- |
| **Next.js 15** | Frontend framework |
| **React 19** | UI components |
| **SCSS & React Modules** | Styling |
| **OpenAI API** | AI model for embeddings & chat responses |
| **Payload CMS** | Content Management System |
| **Drizzle ORM** | Database ORM |
| **Neon Database (Payload)** | Stores CMS data |
| **Neon Database (Embeddings)** | Stores AI-generated vector embeddings |
| **pnpm** | Package manager |
| **Vercel** | Deployment |

* * * * *

**⚡ Quick Start**
-----------------

### **1️⃣ Clone the Repository**

`git clone https://github.com/kyleholloway/ai-rag-portfolio.git
cd ai-rag-portfolio`

### **2️⃣ Install Dependencies**

`pnpm install`

### **3️⃣ Setup Environment Variables**

Create a `.env` file in the root directory and add:

`# Public Variables (Accessible in the Browser)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=https://your-site.dev

# Added by Payload
POSTGRES_URL=postgres://neondb_owner:your-payload-db-password@your-neon-instance-url/neondb?sslmode=require
PAYLOAD_SECRET=your-payload-secret

# Isolated Embeddings DB
EMBEDDINGS_POSTGRES_URL=postgres://neondb_owner:your-embeddings-db-password@your-neon-instance-url/neondb?sslmode=require

# 🔐 Security & API Keys
OPENAI_API_KEY=your-openai-api-key`

> **Note:** If deploying on Vercel, set these in the **Vercel Environment Variables** section.

### **4️⃣ Run Development Server**

`pnpm dev`

Access the site at **<http://localhost:3000>**.

* * * * *

**📖 Project Structure**
------------------------

`ai-rag-portfolio/
│── drizzle/                # Drizzle ORM configuration
│── public/                 # Static assets (favicons, icons)
│── src/
│   ├── app/                # Next.js App Router
│   │   ├── (frontend)/     # Frontend UI components and pages
│   │   ├── (payload)/      # Payload CMS configurations
│   │   ├── api/            # API routes (chat, embeddings)
│   ├── assets/             # Images, icons, and other static assets
│   ├── collections/        # Payload CMS content types
│   ├── components/         # Reusable UI components
│   ├── styles/             # SCSS styles and React modules
│   ├── utils/              # Helper functions (OpenAI, embeddings)
│── .env.example            # Example environment variables
│── package.json            # Project dependencies
│── README.md               # Documentation`

* * * * *

**🧠 How It Works**
-------------------

### **1️⃣ AI Chat System**

-   Users send a question via the chat interface.
-   The system **generates an OpenAI embedding** for the query.
-   A **vector similarity search** is performed on the **Neon Embeddings DB**.
-   The AI **retrieves the most relevant content** and provides a response.

### **2️⃣ Embeddings & Vector Search**

-   **CMS Hooks** generate embeddings on **content updates**.
-   **Drizzle ORM** stores embeddings in the **Neon Vector DB**.
-   On user queries, embeddings are used to find **similar documents**.

### **3️⃣ Payload CMS Content**

-   Stores structured content:
    -   Work Experience
    -   Projects
    -   Skills
    -   Articles
-   Automatically triggers **embedding updates** when content changes.

* * * * *

**⚙️ Deployment**
-----------------

This project is deployed using **Vercel** with **two separate Neon DB instances**.

### **🔹 Deploy on Vercel**

`vercel`

> Ensure all **Environment Variables** are correctly configured in Vercel.

* * * * *

**📝 Open Source**
------------------

This project is **open-source**, allowing developers to explore how it works. However, it **does not accept public contributions or edits**.

* * * * *

**📜 License**
--------------

MIT License © 2025 Kyle Holloway

* * * * *