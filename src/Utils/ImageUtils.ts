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

  // Split a long image into multiple clothing images
  static async splitImage(
    base64Image: string,
    abortSignal?: AbortSignal
  ): Promise<any> {
    // Record this request's timestamp
    const requestTimestamp = Date.now();
    this.pendingRequestTimestamps.push(requestTimestamp);

    try {
      console.log(
        `Starting image split request at timestamp: ${requestTimestamp}`
      );
      const response = await fetch("http://127.0.0.1:5001/image/split", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: base64Image,
        }),
        signal: abortSignal, // Support cancellation
      });

      if (!response.ok) {
        throw new Error("Image splitting failed");
      }

      const data = await response.json();
      console.log("Split image response structure:", Object.keys(data));

      // Debug the response structure
      if (data.segments) {
        console.log("First segment type:", typeof data.segments[0]);
        console.log(
          "First segment sample:",
          typeof data.segments[0] === "string"
            ? data.segments[0].substring(0, 30) + "..."
            : JSON.stringify(data.segments[0]).substring(0, 30) + "..."
        );
      }

      // Remove this timestamp from pending requests
      this.pendingRequestTimestamps = this.pendingRequestTimestamps.filter(
        (ts) => ts !== requestTimestamp
      );

      if (!data.success) {
        throw new Error(data.message || "Image splitting failed");
      }

      // Ensure segments are properly structured
      if (data.segments && Array.isArray(data.segments)) {
        // Check if each segment has the expected structure
        const processedSegments = data.segments
          .map((segment: any, index: number) => {
            console.log(`Processing segment ${index}, type: ${typeof segment}`);

            // If segment is already correctly formatted, return as is
            if (
              segment &&
              typeof segment === "object" &&
              segment.image_base64
            ) {
              console.log(`Segment ${index} already has image_base64 property`);
              return segment;
            }

            // If segment is just a base64 string itself, create proper structure
            if (typeof segment === "string") {
              console.log(`Segment ${index} is a string, creating object`);

              // Check if it already has the data:image prefix
              if (segment.startsWith("data:image")) {
                return { image_base64: segment.split(",")[1] || "" };
              }

              return { image_base64: segment };
            }

            // Handle any other unexpected format with a placeholder to prevent errors
            console.warn(`Segment ${index} has unexpected format:`, segment);
            return { image_base64: "" };
          })
          .filter((segment: any) => segment.image_base64); // Filter out empty segments

        console.log(`Processed ${processedSegments.length} valid segments`);
        return processedSegments;
      }

      // If data.segments is not an array, check if there's an alternative format
      if (data.results && Array.isArray(data.results)) {
        console.log("Using results array instead of segments");
        return data.results
          .map((result: any, index: number) => {
            console.log(
              `Processing result ${index}, keys: ${Object.keys(result)}`
            );
            const base64 = result.image || result.image_base64 || "";
            return { image_base64: base64 };
          })
          .filter((segment: any) => segment.image_base64);
      }

      console.warn("No segments or results found in response");
      return [];
    } catch (error: any) {
      // Remove this timestamp from pending requests
      this.pendingRequestTimestamps = this.pendingRequestTimestamps.filter(
        (ts) => ts !== requestTimestamp
      );

      // Distinguish between network cancellation and other errors
      if (error.name === "AbortError") {
        console.log("Image split request cancelled by user");
        throw new Error("Request cancelled");
      }

      console.error("Image split failed:", error);
      throw error;
    }
  }

  // Upload Base64 image to backend and return processing results, supports cancel request
  static async uploadImage(
    base64Image: string,
    num: number = 5,
    abortSignal?: AbortSignal
  ): Promise<any> {
    // Record this request's timestamp
    const requestTimestamp = Date.now();
    this.pendingRequestTimestamps.push(requestTimestamp);

    // Set up abort event listener before making the request
    if (abortSignal) {
      abortSignal.addEventListener("abort", async () => {
        console.log("AbortSignal triggered, attempting to cancel request");
        await this.handleCancellation();
      });
    }

    try {
      console.log(`Starting request at timestamp: ${requestTimestamp}`);
      const response = await fetch("http://127.0.0.1:5001/relay_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: base64Image,
          num: num, // Number of similar images to return
        }),
        signal: abortSignal, // Support cancellation
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      // Check if the response indicates cancellation
      if (data.status === "cancelled") {
        console.log("Server reported request was cancelled");
        throw new Error("Request cancelled by server");
      }

      // Save request ID for cancellation
      if (data.request_id) {
        this.currentRequestId = data.request_id;
        console.log(`Received request_id: ${data.request_id}`);
      }

      // Remove this timestamp from pending requests
      this.pendingRequestTimestamps = this.pendingRequestTimestamps.filter(
        (ts) => ts !== requestTimestamp
      );

      return data.results || data; // Handle both new and old API response formats
    } catch (error: any) {
      // Remove this timestamp from pending requests
      this.pendingRequestTimestamps = this.pendingRequestTimestamps.filter(
        (ts) => ts !== requestTimestamp
      );

      // Distinguish between network cancellation and other errors
      if (error.name === "AbortError") {
        console.log("Request cancelled by user");
        await this.handleCancellation();
        throw new Error("Request cancelled");
      }

      console.error("Upload failed:", error);
      throw error;
    }
  }

  // Handle cancellation with improved strategies
  private static async handleCancellation(): Promise<void> {
    // Strategy 1: Use specific request ID if we have it
    if (this.currentRequestId) {
      console.log(
        `Using known request_id for cancellation: ${this.currentRequestId}`
      );
      await this.cancelRequest(this.currentRequestId).catch((e) =>
        console.error("Failed to cancel with known request_id:", e)
      );
      return;
    }

    // Strategy 2: Query for active requests - use the new endpoint
    try {
      console.log("Fetching list of active requests...");
      const response = await fetch(
        "http://127.0.0.1:5001/request_status/recent",
        {
          method: "GET",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.requests) && data.requests.length > 0) {
          // Try to cancel all recent requests within our time window
          const now = Date.now();
          const recentRequests = data.requests.filter(
            (req: any) => now - req.timestamp * 1000 < this.REQUEST_WINDOW_MS
          );

          if (recentRequests.length > 0) {
            console.log(
              `Found ${recentRequests.length} recent requests to cancel`
            );
            for (const req of recentRequests) {
              await this.cancelRequest(req.id).catch((e) =>
                console.error(`Failed to cancel request ${req.id}:`, e)
              );
            }
            return;
          } else {
            console.log("No recent requests found to cancel");
          }
        }
      } else {
        console.error(
          "Failed to get active requests, status:",
          response.status
        );
      }
    } catch (e) {
      console.error("Failed to get active requests:", e);
    }

    // Strategy 3: Send cancellation to all recent requests in quick succession
    // This is a fallback if we can't determine which specific request needs cancellation
    try {
      console.log("Using cleanup endpoint as fallback");
      const response = await fetch("http://127.0.0.1:5001/cleanup_requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ max_age_seconds: 10 }), // Clean up very recent requests
      });

      if (response.ok) {
        console.log("Sent cleanup request for all recent requests");
      } else {
        console.error("Cleanup request failed, status:", response.status);
      }
    } catch (e) {
      console.error("Failed to send cleanup request:", e);
    }
  }

  // Notify backend to cancel ongoing request
  static async cancelRequest(requestId: string): Promise<any> {
    if (!requestId) {
      console.error("Cannot cancel: No request ID provided");
      return Promise.reject(new Error("No request ID"));
    }

    try {
      console.log(`Sending cancellation request for ID: ${requestId}`);
      const response = await fetch(
        `http://127.0.0.1:5001/cancel_request/${requestId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log("Cancel request result:", result);
      return result;
    } catch (error) {
      console.error("Failed to send cancel request:", error);
      throw error;
    } finally {
      // Clear current request ID if it matches the one we just cancelled
      if (this.currentRequestId === requestId) {
        this.currentRequestId = null;
      }
    }
  }
}
