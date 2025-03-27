export class ImageUtils {
    // Will be used to store the current request ID
    static currentRequestId: string | null = null;

    // Keep track of pending requests we've sent
    static pendingRequestTimestamps: number[] = [];

    // Time window to look for requests (in ms)
    static readonly REQUEST_WINDOW_MS: number = 5000;

    // Convert file to Base64 string
    static fileToBase64(file: File): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                resolve(base64String);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file); // Read file and trigger onloadend
        });
    }

    // Upload Base64 image to backend and return processing results, supports cancel request
    static async uploadImage(base64Image: string, num: number = 5, abortSignal?: AbortSignal): Promise<any> {
        // Record this request's timestamp
        const requestTimestamp = Date.now();
        this.pendingRequestTimestamps.push(requestTimestamp);

        // Set up abort event listener before making the request
        if (abortSignal) {
            abortSignal.addEventListener('abort', async () => {
                console.log('AbortSignal triggered, attempting to find and cancel request');
                await this.handleCancellation(requestTimestamp);
            });
        }

        try {
            console.log(`Starting request at timestamp: ${requestTimestamp}`);
            const response = await fetch('http://127.0.0.1:5001/relay_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_base64: base64Image,
                    num: num // Number of similar images to return
                }),
                signal: abortSignal // Support cancellation
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            // Save request ID for cancellation
            if (data.request_id) {
                this.currentRequestId = data.request_id;
                console.log(`Received request_id: ${data.request_id}`);
            }

            // Remove this timestamp from pending requests
            this.pendingRequestTimestamps = this.pendingRequestTimestamps.filter(
                ts => ts !== requestTimestamp
            );

            return data.results || data; // Handle both new and old API response formats
        } catch (error: any) {
            // Remove this timestamp from pending requests
            this.pendingRequestTimestamps = this.pendingRequestTimestamps.filter(
                ts => ts !== requestTimestamp
            );

            // Distinguish between network cancellation and other errors
            if (error.name === 'AbortError') {
                console.log('Request cancelled by user');
                await this.handleCancellation(requestTimestamp);
                throw new Error('Request cancelled');
            }

            console.error('Upload failed:', error);
            throw error;
        }
    }

    // Handle cancellation with fallback strategies
    private static async handleCancellation(requestTimestamp: number): Promise<void> {
        // Strategy 1: Use specific request ID if we have it
        if (this.currentRequestId) {
            console.log(`Using known request_id for cancellation: ${this.currentRequestId}`);
            await this.cancelRequest(this.currentRequestId).catch(e =>
                console.error('Failed to cancel with known request_id:', e)
            );
            return;
        }

        // Strategy 2: Query for active requests and try to cancel recent ones
        try {
            console.log('Fetching list of active requests...');
            const response = await fetch('http://127.0.0.1:5001/request_status/recent', {
                method: 'GET'
            });

            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.requests) && data.requests.length > 0) {
                    // Try to cancel all recent requests within our time window
                    const now = Date.now();
                    const recentRequests = data.requests.filter((req: any) =>
                        now - req.timestamp < this.REQUEST_WINDOW_MS
                    );

                    if (recentRequests.length > 0) {
                        console.log(`Found ${recentRequests.length} recent requests to cancel`);
                        for (const req of recentRequests) {
                            await this.cancelRequest(req.id).catch(e =>
                                console.error(`Failed to cancel request ${req.id}:`, e)
                            );
                        }
                        return;
                    }
                }
            }
        } catch (e) {
            console.error('Failed to get active requests:', e);
        }

        // Strategy 3: Send cancellation to all recent requests in quick succession
        // This is a fallback if we can't determine which specific request needs cancellation
        try {
            const response = await fetch('http://127.0.0.1:5001/cleanup_requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ max_age_seconds: 10 }) // Clean up very recent requests
            });

            if (response.ok) {
                console.log('Sent cleanup request for all recent requests');
            }
        } catch (e) {
            console.error('Failed to send cleanup request:', e);
        }
    }

    // Notify backend to cancel ongoing request
    static async cancelRequest(requestId: string): Promise<any> {
        if (!requestId) {
            console.error('Cannot cancel: No request ID provided');
            return Promise.reject(new Error('No request ID'));
        }

        try {
            console.log(`Sending cancellation request for ID: ${requestId}`);
            const response = await fetch(`http://127.0.0.1:5001/cancel_request/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            console.log('Cancel request result:', result);
            return result;
        } catch (error) {
            console.error('Failed to send cancel request:', error);
            throw error;
        } finally {
            // Clear current request ID if it matches the one we just cancelled
            if (this.currentRequestId === requestId) {
                this.currentRequestId = null;
            }
        }
    }
}