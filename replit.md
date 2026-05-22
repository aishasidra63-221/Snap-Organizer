# SnapVault

SnapVault is a smart bulk screenshot organizer — upload 50–500 images, detect duplicates via SHA-256 hashing, auto-categorize into 10 folders using rule-based logic, and download a structured ZIP.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/snapvault run dev` — run the frontend dev server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- No database required — jobs are stored in memory, files in `/tmp/snapvault/<jobId>/`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/snapvault)
- API: Express 5 (artifacts/api-server)
- File upload: multer (multipart/form-data)
- ZIP: jszip
- Hashing: Node.js built-in `crypto` (SHA-256)
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI source of truth
- `lib/api-client-react/src/generated/` — React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Zod schemas (do not edit)
- `artifacts/snapvault/src/pages/Home.tsx` — main 4-step wizard UI
- `artifacts/snapvault/src/lib/upload.ts` — client-side multipart upload helper
- `artifacts/api-server/src/lib/categorizer.ts` — rule-based filename categorization
- `artifacts/api-server/src/lib/jobStore.ts` — in-memory job state store
- `artifacts/api-server/src/routes/upload.ts` — POST /api/upload (multer + hashing)
- `artifacts/api-server/src/routes/jobs.ts` — job CRUD, confirm, ZIP download, cleanup

## Architecture decisions

- Jobs stored in-memory (Map) + temp files in `/tmp` — no DB needed for MVP, trade-off is server restart clears jobs
- File upload is NOT in OpenAPI spec (multipart/form-data Blob types cause Orval codegen issues in Node context); handled via a plain fetch helper on the frontend
- Duplicate detection uses SHA-256 hash comparison; first occurrence wins, subsequent become "Duplicates" category
- Categorization uses ordered filename-pattern rules (RegExp array); first match wins; fallback is "Unknown / Others"
- ZIP built with jszip using DEFLATE level 6 as a balance between speed and compression

## Product

- **Upload**: Drag-and-drop or file picker, up to 500 images per batch
- **Process**: SHA-256 deduplication + 10-category rule-based sorter runs server-side in background
- **Review**: Category preview cards with inline thumbnails, image count per folder
- **Download**: Full ZIP with one folder per category, all originals preserved by name

## Categories

1. OTP / Security
2. Payments / Receipts
3. WhatsApp / Chats
4. Social Media
5. Study / Notes
6. Photos
7. Memes / Entertainment
8. Documents
9. Unknown / Others
10. Duplicates

## User preferences

- No AI — rule-based logic only for MVP
- System must work without external API keys

## Gotchas

- After each OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before editing route handlers
- Do NOT add multipart/form-data upload endpoints to the OpenAPI spec — Orval generates Blob/File types that fail Node.js typecheck
- In-memory job store means jobs are lost on server restart — by design for MVP
- Temp files live in `/tmp/snapvault/<jobId>/` — cleanup route deletes the whole directory

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
