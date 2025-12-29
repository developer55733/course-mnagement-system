# API Testing & Prompting Guide

## Overview

Your API runs on `http://localhost:4000` with base endpoint `/api/users`. This guide shows **6 different tools** to test and prompt your API with complete examples.

---

## Tool Comparison

| Tool | Platform | Ease | Best For | Install |
|------|----------|------|----------|---------|
| **cURL** | Command Line | ⭐⭐⭐ | Quick testing | Pre-installed |
| **Postman** | Desktop/Web | ⭐⭐⭐⭐⭐ | Professional testing | Download |
| **Thunder Client** | VS Code | ⭐⭐⭐⭐ | VS Code users | Extension |
| **REST Client** | VS Code | ⭐⭐⭐⭐ | Code-based testing | Extension |
| **Insomnia** | Desktop | ⭐⭐⭐⭐ | Teams/Collaboration | Download |
| **JavaScript Fetch** | Browser/Node | ⭐⭐⭐ | Frontend integration | Native |

---

## Your API Endpoints

### Base URL
```
http://localhost:4000
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| **GET** | `/api/users/health` | Check DB connection |
| **GET** | `/api/users` | Get all users |
| **GET** | `/api/users/:id` | Get user by ID |
| **POST** | `/api/users` | Create new user |
| **PUT** | `/api/users/:id` | Update user |
| **DELETE** | `/api/users/:id` | Delete user |

---

# Tool 1: cURL (Command Line)

## Best For: Quick testing without GUI

cURL is a command-line tool pre-installed on Windows PowerShell.

### Examples

#### 1️⃣ Health Check
```powershell
curl http://localhost:4000/api/users/health
```

**Output:**
```json
{"success":true,"status":"healthy","db":"connected"}
```

#### 2️⃣ Get All Users
```powershell
curl http://localhost:4000/api/users
```

**Output:**
```json
{"success":true,"data":[{"id":1,"name":"Alice","email":"alice@test.com","created_at":"2025-12-18T10:30:00.000Z"}]}
```

#### 3️⃣ Get User by ID
```powershell
curl http://localhost:4000/api/users/1
```

#### 4️⃣ Create User (POST)
```powershell
curl -X POST http://localhost:4000/api/users `
  -H "Content-Type: application/json" `
  -d '{"name":"Bob","email":"bob@test.com"}'
```

**Response (201 Created):**
```json
{"success":true,"data":{"id":2,"name":"Bob","email":"bob@test.com"}}
```

#### 5️⃣ Update User (PUT)
```powershell
curl -X PUT http://localhost:4000/api/users/1 `
  -H "Content-Type: application/json" `
  -d '{"name":"Alice Updated","email":"alice.new@test.com"}'
```

**Response (200 OK):**
```json
{"success":true,"message":"User updated"}
```

#### 6️⃣ Delete User (DELETE)
```powershell
curl -X DELETE http://localhost:4000/api/users/1
```

**Response (200 OK):**
```json
{"success":true,"message":"User deleted"}
```

### cURL Syntax Reference
```powershell
# Basic GET
curl <url>

# With method
curl -X POST <url>

# With headers
curl -H "Content-Type: application/json" <url>

# With data (JSON body)
curl -d '{"key":"value"}' <url>

# Verbose (show all details)
curl -v <url>

# Save response to file
curl <url> > response.json
```

---

# Tool 2: Postman (GUI - Recommended)

## Best For: Professional API testing & documentation

### Installation

1. Download: [postman.com](https://www.postman.com/downloads/)
2. Install and create a free account
3. Create a new Workspace

### Setup Postman Collection

#### Step 1: Create New Request

1. Click **+ New** → **Request**
2. Name it: `Get All Users`
3. Select method: **GET**
4. URL: `http://localhost:4000/api/users`
5. Click **Send**

#### Step 2: Create POST Request

1. **+ New** → **Request**
2. Name: `Create User`
3. Method: **POST**
4. URL: `http://localhost:4000/api/users`
5. Go to **Body** tab
6. Select **raw** → **JSON**
7. Paste:
```json
{
  "name": "Charlie",
  "email": "charlie@test.com"
}
```
8. Click **Send**

#### Step 3: Create Collection

1. Click **+ New** → **Collection**
2. Name: `My API Tests`
3. Add all requests above to this collection
4. Click **Save**

### Using Variables in Postman

Set base URL as a variable to avoid repetition:

1. Click **Environment** (left sidebar)
2. **+ New Environment**
3. Name: `Local`
4. Add variable:
   - Variable: `base_url`
   - Value: `http://localhost:4000`
5. Save

Now use in requests: `{{base_url}}/api/users`

### Complete Postman Request Examples

**Request 1: Create User**
```
POST {{base_url}}/api/users
Content-Type: application/json

{
  "name": "David",
  "email": "david@test.com"
}
```

**Request 2: Get User by ID (use variable)**
```
GET {{base_url}}/api/users/{{user_id}}
```

Then set `user_id = 1` in the environment variables.

### Postman Tests (Automated Validation)

Add tests to validate responses:

1. Go to **Tests** tab
2. Paste:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has data array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

3. Click **Send** → See test results at bottom

---

# Tool 3: Thunder Client (VS Code Extension)

## Best For: Developers who like staying in VS Code

### Installation

1. Open VS Code
2. Go to **Extensions** (Ctrl+Shift+X)
3. Search: `Thunder Client`
4. Click **Install**

### Usage

1. Click Thunder Client icon (left sidebar)
2. **+ New Request**
3. Enter URL: `http://localhost:4000/api/users`
4. Select method: **GET**
5. Click **Send**

### Create Request with Body

1. **+ New Request**
2. Change method to **POST**
3. URL: `http://localhost:4000/api/users`
4. Go to **Body** tab
5. Select **JSON**
6. Paste:
```json
{
  "name": "Eve",
  "email": "eve@test.com"
}
```
7. Click **Send**

### Save to Collection

1. Right-click request → **Save to Collection**
2. Create new collection: `API Tests`
3. Request saved for future use

---

# Tool 4: REST Client (VS Code Extension)

## Best For: Code-based API testing (file-based)

### Installation

1. VS Code → **Extensions** → Search `REST Client`
2. By Huachao Mao
3. Click **Install**

### Create Test File

1. Create file: `api-test.http`
2. Paste this content:

```http
### Variables
@baseUrl = http://localhost:4000
@contentType = application/json

### Health Check
GET {{baseUrl}}/api/users/health

### Get All Users
GET {{baseUrl}}/api/users

### Get User by ID
GET {{baseUrl}}/api/users/1

### Create User
POST {{baseUrl}}/api/users
Content-Type: {{contentType}}

{
  "name": "Frank",
  "email": "frank@test.com"
}

### Update User
PUT {{baseUrl}}/api/users/1
Content-Type: {{contentType}}

{
  "name": "Frank Updated",
  "email": "frank.updated@test.com"
}

### Delete User
DELETE {{baseUrl}}/api/users/1
```

### Execute Requests

1. Click **Send Request** above each request
2. Response opens in side panel
3. All requests in one file!

---

# Tool 5: Insomnia (Desktop Alternative)

## Best For: Team collaboration & advanced testing

### Installation

1. Download: [insomnia.rest](https://insomnia.rest/download)
2. Install and open
3. Click **Create** → **Request Collection**

### Setup

1. Name: `My API`
2. Create requests like Postman
3. Similar features but cleaner UI

---

# Tool 6: JavaScript Fetch API (Frontend/Node.js)

## Best For: Testing in browser console or Node.js

### Browser Console (F12)

```javascript
// GET all users
fetch('http://localhost:4000/api/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### Create User (Browser)

```javascript
fetch('http://localhost:4000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'Grace',
    email: 'grace@test.com'
  })
})
  .then(response => response.json())
  .then(data => console.log('Created:', data))
  .catch(error => console.error('Error:', error));
```

### Node.js Script (test.js)

Create file `test.js`:

```javascript
// Get all users
async function getAllUsers() {
  try {
    const response = await fetch('http://localhost:4000/api/users');
    const data = await response.json();
    console.log('Users:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Create user
async function createUser(name, email) {
  try {
    const response = await fetch('http://localhost:4000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    const data = await response.json();
    console.log('Created:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
getAllUsers();
createUser('Hannah', 'hannah@test.com');
```

Run it:
```powershell
node test.js
```

---

## Quick Start Comparison

### Fastest Way (cURL - 10 seconds)
```powershell
curl http://localhost:4000/api/users
```

### Most Professional (Postman - 2 minutes)
1. Install Postman
2. Create request
3. Set URL and method
4. Click Send

### Best for VS Code Users (Thunder Client - 1 minute)
1. Install extension
2. New request
3. Send

### Code-Based Testing (REST Client - 30 seconds)
1. Create `.http` file
2. Write requests
3. Click "Send Request"

---

## Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | OK - Success | GET request successful |
| **201** | Created - POST success | User created |
| **400** | Bad Request - Invalid data | Missing required field |
| **404** | Not Found | User ID doesn't exist |
| **500** | Server Error | Database connection failed |

---

## Troubleshooting

### "Connection refused" Error
- ✗ MySQL not running
- ✗ Server not started (npm start)
- ✓ Start MySQL in XAMPP Control Panel
- ✓ Run `npm start` in project folder

### "Invalid JSON" Error
- ✗ Forgot `Content-Type: application/json` header
- ✗ Syntax error in JSON body (trailing commas, quotes)
- ✓ Use proper JSON format
- ✓ Validate JSON online: jsonlint.com

### "Cannot GET /api/users"
- ✗ Wrong URL
- ✓ Use: `http://localhost:4000/api/users`
- ✓ Check port in `.env`

---

## Recommended Setup

1. **Start with cURL** - Test quickly without tools
2. **Install Postman** - For professional workflow
3. **Use REST Client** - For code-based testing
4. **Add Thunder Client** - For VS Code integration

All tools test the same API – choose based on preference!
