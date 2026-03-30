# Building the Project

This project requires Node.js 20+ and handles spaces in the directory name by bypassing the default npm shell wrappers.

## Prerequisites
- Node.js 20 or higher (installed via nvm-windows)
- Firebase CLI (logged in)

## Steps
1. Install dependencies:
   ```powershell
   npm install
   ```
2. Build the project:
   ```powershell
   # Use node directly to bypass shell wrapper issues with spaces in the path
   node "node_modules\next\dist\bin\next" build
   ```
