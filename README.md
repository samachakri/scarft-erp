# SCraft ERP — UPVC Profile Manufacturing & Operations Platform

Internal B2B Manufacturing ERP prototype for **SCraft**, a UPVC profile manufacturing company.

> **Core Business Rule:** Fabricators are SCraft's B2B customers. SCraft manufactures UPVC profiles and sells them to fabricators. This is an internal ERP used exclusively by SCraft employees (no external customer login portal).

## End-to-End Manufacturing Workflow
`WhatsApp / Website / Social` → `Leads` → `Fabricator Customer` → `Quotation` → `Manager Approval` → `Sales Order` → `Inventory Check` → `BOM & Material Requirement (MRP)` → `Raw Material Silos` → `Extrusion Production` → `Finished Profile Stock` → `Dispatch` → `Payment`

## Tech Stack
- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Decoupled Service & Context Architecture** (`src/context/ERPContext.tsx`, `src/types/erp.ts`, `src/data/mockData.ts`) ready for Supabase/PostgreSQL & n8n webhook integration.

## Getting Started

```bash
npm install
npm run dev
```
