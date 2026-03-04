export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/html")) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  },
};
