# LensLab Studio – Camera Rental Management API

## 1. Project Overview

LensLab Studio is a Camera Rental Management System developed using Node.js, Express.js, and SQLite.

The application provides REST APIs to manage cameras, photographers, and camera rental records. It allows users to add, view, update, delete, search, and sort camera details.

## 2. Technologies Used

- **Node.js** – JavaScript runtime environment
- **Express.js** – Backend web framework
- **SQLite** – Database management
- **Postman** – API testing
- **Git & GitHub** – Version control and collaboration

## 3. Database Structure

The project uses three related database tables:

### Cameras
- id
- name
- kind
- brand
- daily_rate
- status

### Photographers
- id
- name
- phone
- email

### Rentals
- id
- photographer_id
- camera_id
- start_date
- end_date
- total_cost

## 4. API Endpoints

### Camera APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cameras` | Get all cameras |
| GET | `/cameras/:id` | Get camera by ID |
| POST | `/cameras` | Add a camera |
| PUT | `/cameras/:id` | Update a camera |
| DELETE | `/cameras/:id` | Delete a camera |

### Photographer APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/photographers` | Get all photographers |
| GET | `/photographers/:id` | Get photographer by ID |
| POST | `/photographers` | Add a photographer |
| PUT | `/photographers/:id` | Update a photographer |
| DELETE | `/photographers/:id` | Delete a photographer |

### Rental APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/rentals` | Get all rentals |
| GET | `/rentals/:id` | Get rental by ID |
| POST | `/rentals` | Add a rental |
| PUT | `/rentals/:id` | Update a rental |
| DELETE | `/rentals/:id` | Delete a rental |

## 5. Camera Search and Sorting

The camera API supports searching and sorting.

Examples:

- `/cameras?brand=Nikon`
- `/cameras?kind=Mirrorless`
- `/cameras?search=Canon`
- `/cameras?sort=name&order=asc`
- `/cameras?sort=name&order=desc`
- `/cameras?sort=colour` – Returns a 400 Bad Request error.

## 6. Installation and Setup

Follow these steps to run the project locally.

**Step 1: Clone the repository**

```bash
git clone https://github.com/Manikanta-09-lab/LensLab-Studio.git
```

**Step 2: Open the project folder**

```bash
cd LensLab-Studio
```

**Step 3: Install dependencies**

```bash
npm install
```

**Step 4: Start the development server**

```bash
npm run dev
```

The server runs at:

`http://localhost:3000`

The SQLite database and required tables are created automatically when the server starts.

## 7. Testing

All API endpoints can be tested using Postman.

The project includes a Postman collection containing requests for camera, photographer, and rental operations.

## 8. Error Handling and Validation

The application includes:

- Required field validation
- Positive number validation for rental costs and camera rates
- Date validation for rental records
- Duplicate photographer email handling
- Invalid ID handling
- Database error handling
- Appropriate HTTP status codes

## 9. Project Structure

```text
LensLab-Studio/
│
├── app.js
├── database.js
├── package.json
├── package-lock.json
├── .gitignore
│
├── postman/
│   └── collections/
│
└── README.md
```

## 10. Conclusion

LensLab Studio demonstrates backend development concepts, REST API design, database connectivity, CRUD operations, input validation, API testing, and version control using Git and GitHub.
