import { Context } from "hono";
import { z } from "@hono/zod-openapi";
import { zpp } from "./helpers";

export const ErrorSchema = zpp(
  z
    .object({
      error: z.object({
        message: z.string(),
        code: z.number(),
        status: z.number(),
      }),
    })
    .openapi("Error")
);

/* _____________ Your Code Here _____________ */

// Base interface for all errors
interface BaseErrorInterFace {
  message: string;
  code: number;
  statusCode: number;
}

// Specific error types with their status codes
interface Error400 extends BaseErrorInterFace {
  statusCode: 400;
}

interface Error500 extends BaseErrorInterFace {
  statusCode: 500;
}

// Error code constants
const ErrorCodes = {
  Prisma: {
    BadRequest: 100,
    InternalServerError: 101,
    UnknownError: 102,
    ResourceNotFound: 103,
    AlreadyExists: 104,
  },
} as const;

// Type for error codes
type ErrorCode = typeof ErrorCodes.Prisma[keyof typeof ErrorCodes.Prisma];

// Implement the Error Definitions and create errors like shown in the readme

// Implement the errorToHTTPException function.
export const errorToHTTPException = <
  T extends BaseErrorInterFace,
  C extends 400 | 500
>(
  c: Context,
  error: T
) => {
  return c.json(
    ErrorSchema.new({
      error: {
        message: error.message,
        code: error.code,
        status: error.statusCode,
      },
    }),
    error.statusCode as C
  );
};

// Error class creator
function createErrorClass<T extends 400 | 500>(
  statusCode: T,
  code: number,
  category: string
) {
  return class extends Error {
    statusCode: T;
    code: number;
    category: string;

    constructor(message: string) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.category = category;
    }
  };
}

// Create error classes
export const Error_400 = createErrorClass(400, 0, 'GENERAL');
export const Error_500 = createErrorClass(500, 0, 'GENERAL');

// Create Prisma errors
export const PrismaError = {
  BadRequest: createErrorClass(
    400,
    ErrorCodes.Prisma.BadRequest,
    'PRISMA'
  ),
  InternalServerError: createErrorClass(
    500,
    ErrorCodes.Prisma.InternalServerError,
    'PRISMA'
  ),
  UnknownError: createErrorClass(
    500,
    ErrorCodes.Prisma.UnknownError,
    'PRISMA'
  ),
  ResourceNotFound: createErrorClass(
    400,
    ErrorCodes.Prisma.ResourceNotFound,
    'PRISMA'
  ),
  AlreadyExists: createErrorClass(
    400,
    ErrorCodes.Prisma.AlreadyExists,
    'PRISMA'
  ),
};
