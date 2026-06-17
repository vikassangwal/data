import { getSystemSettingDecrypted } from '@/app/actions/vault';

export interface IntegrationPayload {
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  data?: any;
}

/**
 * UniversalGateway handles auto-execution of registered APIs without hardcoding.
 * It looks up the dynamically saved API key and Base URL, and dispatches the request.
 */
export class UniversalGateway {
  
  /**
   * Executes a request to any saved tool (predefined or custom).
   * @param toolId The ID of the tool (e.g. 'stripe', 'custom_tool')
   * @param payload The request data and parameters
   */
  static async execute(toolId: string, payload: IntegrationPayload) {
    const formattedToolId = toolId.replace(/\s+/g, '_').toUpperCase();
    
    // 1. Fetch Key and URL dynamically
    const apiKey = await getSystemSettingDecrypted(`INTEGRATION_KEY_${formattedToolId}`);
    if (!apiKey) {
      throw new Error(`Integration [${toolId}] is not configured or missing API Key.`);
    }

    // 2. Resolve Base URL
    let baseUrl = await getSystemSettingDecrypted(`INTEGRATION_URL_${formattedToolId}`);
    if (!baseUrl) baseUrl = this.resolveDefaultBaseUrl(toolId);
    if (!baseUrl) {
      throw new Error(`Integration [${toolId}] missing Base URL.`);
    }

    // 3. Construct Request
    const method = payload.method || 'POST';
    const finalUrl = payload.endpoint ? `${baseUrl.replace(/\/$/, '')}/${payload.endpoint.replace(/^\//, '')}` : baseUrl;
    
    // Auto-detect header formatting based on standard tool patterns
    const headers = { ...this.resolveDefaultHeaders(toolId, apiKey), ...payload.headers };

    // 4. Dispatch
    try {
      const response = await fetch(finalUrl, {
        method,
        headers,
        body: ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(payload.data),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(`Integration Error: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      return { success: true, data: responseData };

    } catch (error: any) {
      console.error(`[UniversalGateway] Execution failed for ${toolId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Pre-configured Base URLs for standard tools to eliminate configuration overhead
  private static resolveDefaultBaseUrl(toolId: string): string {
    switch (toolId) {
      case 'stripe': return 'https://api.stripe.com/v1';
      case 'razorpay': return 'https://api.razorpay.com/v1';
      case 'google_calendar': return 'https://www.googleapis.com/calendar/v3';
      case 'google_sheets': return 'https://sheets.googleapis.com/v4';
      case 'youtube': return 'https://www.googleapis.com/youtube/v3';
      default: return '';
    }
  }

  // Pre-configured Headers for standard tools
  private static resolveDefaultHeaders(toolId: string, apiKey: string): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    
    switch (toolId) {
      case 'stripe': 
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'razorpay': 
        headers['Authorization'] = `Basic ${Buffer.from(apiKey).toString('base64')}`;
        break;
      case 'google_calendar':
      case 'google_sheets':
      case 'youtube':
        // Standard OAuth/Service Account Bearer token or API key
        headers['Authorization'] = `Bearer ${apiKey}`;
        // Note: For YouTube Data API, it's often passed as ?key=apiKey, 
        // but Bearer works if using OAuth service accounts.
        break;
      default:
        // Default assumption for custom tools
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }
    
    return headers;
  }
}
