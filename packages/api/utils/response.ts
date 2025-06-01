import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { ErrorType } from '../constants/error';
import { ApiError, handleZodError } from './error';

export class ApiResponse {
  /**
   * Create a successful API response
   * @param data - The data to include in the response
   * @param status - The HTTP status code (default: 200)
   * @returns A NextResponse object with the success flag and data
   */
  static success<T>(data: T, status = 200) {
    return NextResponse.json(
      { success: true, data },
      { status }
    );
  }

  /**
   * Create an error API response
   * @param error - The error to include in the response
   * @returns A NextResponse object with the error flag and error details
   */
  static error(error: ApiError) {
    return NextResponse.json(
      {
        success: false,
        ...error.toResponse()
      },
      { status: error.status }
    );
  }
}

/**
 * Legacy function for backward compatibility
 * @param data - The data to include in the response
 * @param status - The HTTP status code (default: 200)
 * @returns A NextResponse object with the success flag and data
 */
export function successResponse<T>(data: T, status = 200) {
  return ApiResponse.success(data, status);
}

/**
 * Wrapper for route handlers to simplify error handling
 * @param handler The route handler function
 * @returns A wrapped handler function with error handling
 */
export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return ApiResponse.error(error);
      }
      
      if (error instanceof ZodError) {
        return ApiResponse.error(handleZodError(error));
      }
      
      return ApiResponse.error(new ApiError(ErrorType.SERVER_ERROR));
    }
  };
}

// Legacy exports for backward compatibility
export const success = ApiResponse.success;
export const created = (data: any) => ApiResponse.success(data, 201);
export const error = (message: string, status = 500) => 
  ApiResponse.error(new ApiError(ErrorType.SERVER_ERROR, message));
