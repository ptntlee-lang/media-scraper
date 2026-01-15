# Backend (NestJS)

This backend exposes scraping and media APIs. Swagger UI is available when the server is running.

## Swagger API Docs

- URL: `http://localhost:3001/api-docs`
- The OpenAPI JSON is available at: `http://localhost:3001/api-json`

## Run locally

```bash
cd backend
npm install
npm run start:dev
```

Then open the Swagger UI in your browser at `http://localhost:3001/api-docs`.

## Notes

- Swagger is configured in `src/main.ts` using `@nestjs/swagger` and mounted at `/api-docs`.
- If you changed the port via `PORT` env var, replace `3001` with your configured port.
- For production, consider securing the Swagger UI behind auth or enabling it only in non-production environments.
