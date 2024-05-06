**Prerequisites:** Make sure you have [Node.js](https://nodejs.org/) (v14+ recommended) installed

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
4. Once the application is running, check the console output for a message indicating the port number the application is listening on. You should see a line similar to:
```bash
Server listening on port 5000
```
Replace `PORT` with the correct port number to access and test the application locally in the browser.
```url
http://localhost:PORT
```
