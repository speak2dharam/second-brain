# Technology

_Living document. Last updated: 2026-10-10_

## Chosen stack (user, 2026-10-10) (D-024)
| Layer | Choice |
|---|---|
| Backend | **.NET** (C#) |
| Frontend | **React** |
| Database | **PostgreSQL** |
| Hosting | **Azure**, for everything |

## Assessment: a good fit ✅
| Choice | Why it fits this project | Watch out for |
|---|---|---|
| **.NET** | Microsoft's own libraries are strongest in .NET: the **Microsoft Graph SDK** (email, Teams, SharePoint, OneDrive, Entra users), **Microsoft.Identity.Web** (Entra sign-in), Azure DevOps client libraries, Azure SDKs. Good AI libraries (Microsoft.Extensions.AI, Semantic Kernel). Built-in background workers for data syncing | Use the current LTS version (.NET 10) |
| **React** | Huge ecosystem. **MSAL React** gives the silent Microsoft sign-in we want (D-007). Well suited to a streaming chat UI. The user's own strength. The clickthrough demo can be built in React too | Pick a component library (Q-046) |
| **PostgreSQL** | Mature, no licence cost, fully managed on Azure (*Azure Database for PostgreSQL – Flexible Server*). The **pgvector** extension adds AI search in the same database. **Row-level security** can enforce "who sees what" inside the database itself. **JSONB** columns handle the different shapes of data from different sources (fits pluggable sources, D-005) | Data volume: everyone's email, Teams messages and documents add up (Q-044). Keep files/attachments in Blob Storage, not in the database |
| **Azure** | Same Microsoft tenant as Entra/M365. Data stays in UnifyCloud's own cloud. Managed Identity and Key Vault for secrets. Azure-hosted AI models | Region choice and running costs (Q-017, Q-045) |

## Gap: the AI layer isn't chosen yet
The stack needs an AI part: a **chat model** for the assistant and for extracting data from emails, and an **embedding model** that turns text into vectors for search.

**Recommendation:** use **Azure AI Foundry**. Models run inside UnifyCloud's Azure subscription under Microsoft's enterprise data terms, and prompts and data aren't used to train the models. Foundry offers models from several providers (OpenAI, Anthropic and others). **Choose the specific model(s) later by testing them on our real questions.** (Q-047)

## Proposed Azure building blocks _(Claude's recommendation, to confirm: Q-047)_
| Need | Azure service |
|---|---|
| Frontend hosting | Azure Static Web Apps (or App Service) |
| Backend API (.NET) | Azure App Service or Azure Container Apps |
| **Data sync workers** (pull from Graph, DevOps, portals on a schedule) | .NET worker service on Container Apps, or Azure Functions |
| Database | Azure Database for PostgreSQL – Flexible Server, with **pgvector** |
| Files, attachments, Excel uploads | Azure Blob Storage |
| AI models | Azure AI Foundry |
| Text from PDF/Word/Excel/PowerPoint files | Azure AI Document Intelligence (or .NET libraries) |
| Secrets (Graph app credentials, portal API keys) | Azure Key Vault + Managed Identity |
| Login | Microsoft Entra ID (app registration) |
| Monitoring & logs | Application Insights / Azure Monitor |
| Network | **Private endpoints / VNet**, so the database and storage aren't reachable from the public internet. This is highly sensitive data |

```
 Browser (React + MSAL) ──SSO──▶ Entra ID
        │
        ▼
 .NET API ──▶ PostgreSQL (data + pgvector + row-level security)
   │   └────▶ Azure AI Foundry (chat + embedding models)
   │
 Sync workers ──▶ Microsoft Graph (mail, Teams, SharePoint, OneDrive, users)
              ──▶ Azure DevOps API · Partner Center API · in-house portals / Excel
              ──▶ Blob Storage (files)
```

## Key technical patterns _(Claude's recommendation)_
1. **Permissions before AI.** Enforce "who sees what" in the database (row-level security) and in the API. The AI only ever receives data the user may see ([ai-features.md](ai-features.md#key-design-principle-claudes-recommendation-to-confirm)).
2. **The AI assistant is an "agent with tools":**
   - **Factual questions** ("emails with Anil Tiwari", "my team's leaves", "Noida staff") → **database queries**.
   - **Meaning-based questions** ("what did the customer say about pricing?") → **vector search** (pgvector).
   - Both go through the same permission filter.
3. **Efficient syncing from Microsoft:** use Graph **delta queries** (fetch only what changed) and **change notifications** (webhooks), and respect Graph's throttling limits. **Exclusions are applied at sync time**, so excluded people's data is never downloaded (D-008).
4. **Pluggable connectors:** each data source is a module with the same interface (connect, sync, its access types, its explorer views). This makes D-005 and D-022 real.
5. **Storage split:** original files in Blob Storage; extracted text, metadata and vectors in PostgreSQL.

## Alternatives considered
| Option | Note |
|---|---|
| Azure AI Search instead of pgvector | Azure's dedicated search service: very good hybrid/semantic search and built-in text extraction from documents. But it costs extra, and permissions must be kept in sync in a second place. **Keep as a fallback** if pgvector's search quality or scale isn't enough |
| Azure SQL instead of PostgreSQL | Also fine on Azure. The user chose PostgreSQL; its lower cost and mature pgvector support suit us |
| **Buy Microsoft 365 Copilot instead of building** | Copilot answers questions over a user's *own* M365 data. It does **not** cover our core needs: Admin/role-based access across staff (D-015, D-021), the Noida/person activity views (D-019), Nomination Tracker write-back (D-014), or in-house portals. **So a custom build is justified.** Copilot could still sit alongside for personal productivity |

## Clickthrough note
The Phase 2 clickthrough can be built in **React with mock data**, so its screens can carry over into the real frontend. To decide in Phase 2.
