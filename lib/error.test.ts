import { Context } from 'hono';
import { errorToHTTPException, PrismaError } from './error';

// Mock Hono Context
const mockContext = {
  json: (data: any, status: number) => ({
    _data: data,
    status
  })
} as unknown as Context;

console.log('Running runtime tests...');

// Test 400 errors
{
  const error = new PrismaError.BadRequest('Invalid request');
  const result = errorToHTTPException(mockContext, error);
  
  console.assert(result.status === 400, 'Status should be 400');
  console.assert(result._data.error.message === 'Invalid request', 'Message should match');
  console.assert(result._data.error.code === 100, 'Code should be 100');
  console.assert(result._data.error.status === 400, 'Error status should be 400');
}

// Test 500 errors
{
  const error = new PrismaError.InternalServerError('Server error');
  const result = errorToHTTPException(mockContext, error);
  
  console.assert(result.status === 500, 'Status should be 500');
  console.assert(result._data.error.message === 'Server error', 'Message should match');
  console.assert(result._data.error.code === 101, 'Code should be 101');
  console.assert(result._data.error.status === 500, 'Error status should be 500');
}

// Test ResourceNotFound errors
{
  const error = new PrismaError.ResourceNotFound('Resource not found');
  const result = errorToHTTPException(mockContext, error);
  
  console.assert(result.status === 400, 'Status should be 400');
  console.assert(result._data.error.message === 'Resource not found', 'Message should match');
  console.assert(result._data.error.code === 103, 'Code should be 103');
  console.assert(result._data.error.status === 400, 'Error status should be 400');
}

console.log('Runtime tests passed!');
console.log('\nTo verify type checking, run: bun tsc --noEmit');
console.log('The following type errors are expected:');

// Type checking tests - these should fail during TypeScript compilation
{
  // @ts-expect-error - Should fail: Using 500 status code with 400 error
  const badRequestWith500 = errorToHTTPException<typeof PrismaError.BadRequest, 500>(
    mockContext,
    new PrismaError.BadRequest('Invalid request')
  );

  // @ts-expect-error - Should fail: Using 400 status code with 500 error
  const serverErrorWith400 = errorToHTTPException<typeof PrismaError.InternalServerError, 400>(
    mockContext,
    new PrismaError.InternalServerError('Server error')
  );

  // @ts-expect-error - Should fail: Using wrong error type
  const wrongErrorType = errorToHTTPException<typeof PrismaError.UnknownError, 400>(
    mockContext,
    new PrismaError.BadRequest('Invalid request')
  );
} 