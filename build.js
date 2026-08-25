const builder = require("electron-builder");
builder.build({
  targets: builder.Platform.WINDOWS.createTarget(),
  config: {
    // Add any necessary config here or it will read package.json
  }
}).then(() => {
  console.log("Build complete");
}).catch((err) => {
  console.error("Build failed:", err);
});
