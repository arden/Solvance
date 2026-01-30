// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ScanRequest {
  contractAddress: string;
  forceRefresh?: boolean;
}

/**
 * Scan a token contract address
 */
export async function scanToken(
  contractAddress: string,
  forceRefresh: boolean = false
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contractAddress,
        forceRefresh,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    };
  }
}

/**
 * Get scan status
 */
export async function getScanStatus(
  contractAddress: string
): Promise<ApiResponse<{ cached: boolean; timestamp?: number }>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/scan/status?address=${encodeURIComponent(contractAddress)}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    };
  }
}

/**
 * Invalidate cache
 */
export async function invalidateCache(
  contractAddress: string
): Promise<ApiResponse<{ invalidated: boolean }>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/scan/cache?address=${encodeURIComponent(contractAddress)}`,
      {
        method: 'DELETE',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to server',
      },
    };
  }
}
