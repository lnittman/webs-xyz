import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { database } from '@repo/database'
import { withAuthenticatedUser } from '@/lib/api/auth'
import { withErrorHandling } from '@/lib/api/response'
import { ApiError } from '@/lib/api/error'
import { ErrorType, ResourceType } from '@/lib/api/constants'

const updateEmojiSchema = z.object({
  emoji: z.string().min(1).max(10), // Allow emoji characters (usually 1-4 chars, but some complex ones can be longer)
})

export const PATCH = withErrorHandling(
  withAuthenticatedUser<{ id: string }>(async (request, { params, userId }) => {
    const webId = params.id
    if (!webId) {
      throw ApiError.missingParam('id')
    }

    // Parse request body
    const body = await request.json()
    const validatedData = updateEmojiSchema.parse(body)

    // Check if the web exists and belongs to the user
    const existingWeb = await database.web.findFirst({
      where: {
        id: webId,
        userId,
      },
    })

    if (!existingWeb) {
      throw ApiError.notFound(ResourceType.WEB, webId)
    }

    // Update the emoji
    const updatedWeb = await database.web.update({
      where: {
        id: webId,
      },
      data: {
        emoji: validatedData.emoji,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedWeb.id,
        emoji: updatedWeb.emoji,
        updatedAt: updatedWeb.updatedAt.toISOString(),
      },
    })
  })
) 