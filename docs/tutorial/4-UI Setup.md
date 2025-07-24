**Prerequisites:** 
Make sure you have [Node.js](https://nodejs.org/) (v21+ recommended) installed.

**Setup and Run the UI Locally:**
1. Navigate to the `ui` folder.
    ```bash
    cd ui
    ```
2. Install the dependencies (node_modules).
    ```bash
    npm install
    ```
3. Return to the root folder and start the application. This will start both the backend and frontend.
    ```bash
    cd .. && npm run watch
    ```
4. Once the application has started, it will automatically open the correct URL in your browser:
    ```bash
    http://localhost:5000/index.html
    ```
    This route is handled by the AppRouter, which performs authentication and proxies requests to the frontend (8080) and backend (4040) services accordingly.
