import { handle } from "hono/vercel";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { createOpenAPIResponseSchema } from "@/lib/helpers";
import { ErrorSchema, errorToHTTPException, PrismaError } from "@/lib/error";

export const config = {
  runtime: "edge",
};

// Base path is automatically prefixed by Next.js with `/api`,
// but adding it here makes local testing outside Next easier.
const app = new OpenAPIHono().basePath("/api");

// -----------------------------
// Routes
// -----------------------------

// 1. Hello endpoint                GET /api/hello
const helloRoute = createRoute({
  method: "get",
  path: "/hello",
  responses: {
    200: {
      description: "Return a greeting message",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    400: createOpenAPIResponseSchema(ErrorSchema, "Bad request"),
    500: createOpenAPIResponseSchema(ErrorSchema, "Internal server error"),
  },
});

app.openapi(helloRoute, (c) => {
  if (Math.random() > 0.5) {
    // this throws type error (example)
    // return c.json({ message: "Not implemented" }, 501);

    // Example of type checking with error
    const mockError = new PrismaError.BadRequest('Invalid request');
    return errorToHTTPException(c, mockError);
  }

  return c.json({ message: "Hello from Hono + OpenAPI!" }, 200);
});

// 2. Expose the generated OpenAPI spec  GET /api/doc
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Example API",
    version: "1.0.0",
  },
});

// -----------------------------
// Next.js handler
// -----------------------------
export default handle(app);
