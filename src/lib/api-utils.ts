import { NextRequest, NextResponse } from 'next/server';

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Success response helper
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  } as ApiResponse<T>);
}

// Error response helper
export function errorResponse(error: string, status: number = 400): NextResponse {
  return NextResponse.json({
    success: false,
    error
  } as ApiResponse, { status });
}

// Get session ID from headers
export function getSessionId(request: NextRequest): string | null {
  return request.headers.get('x-session-id');
}

// Validate required fields
export function validateRequiredFields(data: Record<string, unknown>, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `Field '${field}' is required`;
    }
  }
  return null;
}

// Parse JSON body safely
export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

// Handle API errors
export function handleApiError(error: Error | unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error && error.message) {
    return errorResponse(error.message, 400);
  }
  
  return errorResponse('Internal server error', 500);
}