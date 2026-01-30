import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { scanService } from '@/services/scan.js';
import { ApiResponse, ScanRequest } from '@/types/index.js';
import { env } from '@/config/index.js';

const scanRouter = new Hono();

// Validation schema
const scanSchema = z.object({
  contractAddress: z.string().min(32, 'Invalid contract address'),
  forceRefresh: z.boolean().optional(),
});

/**
 * POST /api/scan - Scan a token
 */
scanRouter.post('/', async (c) => {
  try {
    const body = await c.req.json();

    // Validate request
    const validation = scanSchema.safeParse(body);
    if (!validation.success) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.errors[0].message,
          },
        },
        400
      );
    }

    const { contractAddress, forceRefresh = false } = validation.data;

    // Scan token
    const result = await scanService.scanToken(contractAddress, forceRefresh);

    return c.json<ApiResponse>(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error: any) {
    console.error('❌ Scan API error:', error);

    return c.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'SCAN_ERROR',
          message: error.message || 'Failed to scan token',
        },
      },
      500
    );
  }
});

/**
 * GET /api/scan/status - Get scan status
 */
scanRouter.get('/status', async (c) => {
  try {
    const contractAddress = c.req.query('address');

    if (!contractAddress) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_ADDRESS',
            message: 'Contract address is required',
          },
        },
        400
      );
    }

    const status = await scanService.getScanStatus(contractAddress);

    return c.json<ApiResponse>(
      {
        success: true,
        data: status,
      },
      200
    );
  } catch (error: any) {
    console.error('❌ Status API error:', error);

    return c.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'STATUS_ERROR',
          message: error.message || 'Failed to get scan status',
        },
      },
      500
    );
  }
});

/**
 * DELETE /api/scan/cache - Invalidate cache
 */
scanRouter.delete('/cache', async (c) => {
  try {
    const contractAddress = c.req.query('address');

    if (!contractAddress) {
      return c.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'MISSING_ADDRESS',
            message: 'Contract address is required',
          },
        },
        400
      );
    }

    const success = await scanService.invalidateCache(contractAddress);

    return c.json<ApiResponse>(
      {
        success: true,
        data: { invalidated: success },
      },
      200
    );
  } catch (error: any) {
    console.error('❌ Cache API error:', error);

    return c.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'CACHE_ERROR',
          message: error.message || 'Failed to invalidate cache',
        },
      },
      500
    );
  }
});

export default scanRouter;
