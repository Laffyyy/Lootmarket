module.exports = {
    devServer: (configFunction) => {
      return (proxy, allowedHost) => {
        // Get the original config from CRA
        const config = configFunction(proxy, allowedHost);
        
        // Override allowedHosts (fixes your error)
        config.allowedHosts = ['auto']; // or ['localhost', 'example.com'] for specific hosts
        
        // Add other devServer customizations here if needed
        // config.https = true; // Example: Enable HTTPS
        
        return config;
      };
    },
    
    // Optional: Add other webpack overrides here
    webpack: (config, env) => {
      // Customize webpack config if needed
      return config;
    }
  };