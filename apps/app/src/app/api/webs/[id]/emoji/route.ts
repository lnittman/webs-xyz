import { NextRequest } from 'next/server'
import { websService, webIdParamSchema } from '@repo/api'
import { withAuthenticatedUser } from '@repo/api/utils/auth'
import { withErrorHandling, ApiResponse } from '@repo/api/utils/response'
import { ApiError } from '@repo/api/utils/error'
import { ErrorType, ResourceType } from '@repo/api/constants'

async function handleUpdateEmoji(
  request: NextRequest,
  { params, userId }: { params: Promise<{ id: string }>; userId: string }
) {
  const resolvedParams = await params;
  const { id } = webIdParamSchema.parse(resolvedParams)
  const { emoji } = await request.json()

  if (!emoji || typeof emoji !== 'string') {
    throw new ApiError(ErrorType.VALIDATION, 'Emoji is required and must be a string')
  }

  // Verify web exists and user has access
  const web = await websService.getWebById(id)
  if (!web) {
    throw ApiError.notFound(ResourceType.WEB, id)
  }

  if (web.userId !== userId) {
    throw ApiError.unauthorized('You do not have access to this web')
  }

  const updatedWeb = await websService.updateWebEmoji(id, emoji)
  return ApiResponse.success(updatedWeb)
}

export const PATCH = withErrorHandling(withAuthenticatedUser(handleUpdateEmoji)) 