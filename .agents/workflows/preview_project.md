# Previewing the Project

This project uses a custom port (9002) and requires bypassing the default npm shell wrappers on Windows due to spaces in the path.

## Steps
1. Start the development server:
   ```powershell
   # Use node directly to bypass shell wrapper issues with spaces in the path
   node "node_modules\next\dist\bin\next" dev --turbopack -p 9002
   ```
2. Open the browser to:
   [http://localhost:9002](http://localhost:9002)
