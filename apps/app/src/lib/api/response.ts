import { NextResponse } from 'next/server';

type SuccessResponse<T> = { success: true; data: T };
type ErrorResponse = { success: false; message: string };

export function success<T>(data: T, status = 200) {
  return NextResponse.json<SuccessResponse<T>>(
    { success: true, data },
    { status },
  );
}

export function created<T>(data: T) {
  return success(data, 201);
}

export function error(message: string, status = 500) {
  return NextResponse.json<ErrorResponse>(
    { success: false, message },
    { status },
  );
}
