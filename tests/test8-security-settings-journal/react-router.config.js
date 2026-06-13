export default {
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  future: {
    // Required for route `clientMiddleware` auth guards (RR v7.16+)
    v8_middleware: true,
    v8_passThroughRequests: true,
    v8_splitRouteModules: true,
    v8_trailingSlashAwareDataRequests: true,
    v8_viteEnvironmentApi: true,
  },
};
