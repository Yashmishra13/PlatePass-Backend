# PlatePass Backend
This is the backend service for **PlatePass**, built by CASP for secure, automated vehicle access using license plate recognition and remote control systems.
## 📦 Tech Stack
- **Node.js**
- **Express**
- **Firebase Firestore**
- **Shelly Relay (HTTP Trigger)**
- **Postman** (for testing)
## 🚀 API Endpoints
### `POST /checkPlate`
- Checks if the license plate exists in the database.
- If valid: triggers Shelly relay and logs access.
- If invalid: returns 403 Unauthorized.
**Request Body:**
```json
{
  "plate": "ABC123"
}
```
**Response:**
- `200 OK` – Plate matched. Gate opened.
- `403` – Plate not authorized.
- `400` – Missing plate in request.
### `POST /openDoor`
- Manual override to open the gate (e.g., from mobile app).
- Triggers relay and logs `user`, `reason`, and timestamp.
**Request Body (optional):**
```json
{
  "user": "Yash",
  "reason": "Manual test"
}
```
If no body is provided, it defaults to:
- `user`: `"ManualTrigger"`
- `reason`: `"Manual override"`
**Response:**
- `200 OK` – Gate manually opened.
- `500` – Relay or log failure.
## 🔐 Environment Variables (`.env`)
> ⚠️ Not included in repo – must be created locally.
```env
SHELLY_URL=http://192.168.1.121/relay/0/on
PORT=3000
```
## 🗃 Folder Structure
```
routes/
  ├── checkPlate.js
  └── openDoor.js
utils/
  └── TriggerRelay.js
.env               (ignored)
firebase-key.json  (ignored)
index.js
.gitignore
package.json
```
## 🛠 Setup & Run
```bash
npm install
node index.js
```
Backend will run on: `http://localhost:3000` (or whatever port you define in `.env`)
## 🔒 Git Ignore Setup
Your `.gitignore` file should contain:
```gitignore
node_modules/
.env
firebase-key.json
```
This ensures sensitive files are excluded from the repo.
## 🧠 Author
**Yash Mishra**  
Founder @ CASP | Smart City Automation  
GitHub: [@Yashmishra13](https://github.com/Yashmishra13)
## 📅 Status
✅ Backend API complete  
🔜 Frontend app (React Native) begins Week 2
