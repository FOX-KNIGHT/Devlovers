/**
 * In-memory sliding window rate limiter for MCP server consumers.
 * Default: 60 requests per 60,000ms (1 minute) per client identifier.
 */
class SlidingWindowRateLimiter {
  constructor(options = {}) {
    this.limit = options.limit || 60;
    this.windowMs = options.windowMs || 60 * 1000;
    this.clients = new Map();
  }

  /**
   * Check if client exceeds rate limit and record the request
   * @param {string} clientId IP address or Bearer token hash
   * @returns {{ success: boolean, limit: number, remaining: number, resetTime: number }}
   */
  check(clientId = 'default') {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let timestamps = this.clients.get(clientId) || [];

    // Filter out timestamps outside the active sliding window
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= this.limit) {
      const oldestInWindow = timestamps[0] || now;
      const resetTime = oldestInWindow + this.windowMs;
      this.clients.set(clientId, timestamps);
      return {
        success: false,
        limit: this.limit,
        remaining: 0,
        resetTime,
      };
    }

    // Add current request timestamp
    timestamps.push(now);
    this.clients.set(clientId, timestamps);

    const resetTime = now + this.windowMs;
    const remaining = Math.max(0, this.limit - timestamps.length);

    return {
      success: true,
      limit: this.limit,
      remaining,
      resetTime,
    };
  }

  /**
   * Clean up stale clients
   */
  prune() {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    for (const [clientId, timestamps] of this.clients.entries()) {
      const active = timestamps.filter((t) => t > windowStart);
      if (active.length === 0) {
        this.clients.delete(clientId);
      } else {
        this.clients.set(clientId, active);
      }
    }
  }

  /**
   * Reset client rate limit (primarily for testing)
   */
  reset(clientId) {
    if (clientId) {
      this.clients.delete(clientId);
    } else {
      this.clients.clear();
    }
  }
}

export const mcpRateLimiter = new SlidingWindowRateLimiter({
  limit: 60,
  windowMs: 60 * 1000,
});
