## 🛡️ Sandbox Fix (Linux)
# Electron on Linux may fail to start due to sandbox permission issues.
# These commands set the correct ownership and permissions for chrome-sandbox.
# Run them once after installing dependencies.

cd /home/anesbenahmed/javascript/quran/node_modules/electron/dist
sudo chown root:root chrome-sandbox   # Make root the owner
sudo chmod 4755 chrome-sandbox        # Set the SUID bit for secure sandboxing

# ✅ After this, Electron should launch without the sandbox error.
# ⚠️ Alternative (not recommended for production):
# electron --no-sandbox

---

## 🎨 Tailwind Build (CLI Mode)
# This project uses TailwindCSS without PostCSS
# Use the Tailwind CLI to compile styles from input.css to output.css
# and keep watching for changes during development.

npx tailwindcss -i ./src/renderer/src/assets/styles/input.css \
  -o ./src/renderer/src/assets/styles/output.css \
  --watch

# - input.css  → contains @tailwind directives (base, components, utilities)
# - output.css → generated file with all Tailwind utilities
# - --watch    → rebuilds automatically whenever files are updated
