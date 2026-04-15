README.md

# Surrey Food Bank Appointment and Registration System

## Project Description
This web application allows prospective clients of The Surrey Food bank to book a registration appointment, and staff to manage the appointments.

## Features
- Applicants can create an account, complete a registration form, and book an appointment on behalf of their household
- Applicants can reschedule or cancel their appointments and edit their registration form
- Staff can access the application through a secure login portal
- Staff can easily view and manage appointments on a weekly-view calendar
- Staff can book, change, and cancel appointments on behalf of applicants
- Staff can browse and search through a database of registered applicants
- Staff can block appointment time slots to mark unavailability

## Tech Stack
| Layer       | Technology                       |
| :---------- | :------------------------------- |
| Runtime     | Node.js + Express.js             |
| Language    | JavaScript                       |
| Frontend    | Vite + React + MUI               |
| Database    | PostgreSQL + Supabase            |
| HTTP Client | Fetch API                        |
| Testing     | Vitest + React Testing Library   |
| CI/CD       | GitHub Actions                   |
| Hosting     | GitHub Pages                     |

## Quick Start

### Assumptions:
- Works on macOS, Windows, and Linux. No OS‑specific version requirements. 
- The .env variables for running locally are in the final evaluation document. They allow you to connect to the database and log into the staff side.
- The admin login account credentials are in the final evaluation document.

### Option 1: Visit the Deployed App
The app is hosted on GitHub Pages.

The applicant side of the application can be accessed here:
[https://annaliese8.github.io/CPSC319_Project/](https://annaliese8.github.io/CPSC319_Project/)

To access the staff side of the application, copy the following link and replace <VITE_STAFF_BASE> with the value specified in the final project evaluation document: [http://localhost:5173/CPSC319_Project/#/<VITE_STAFF_BASE>/login](http://localhost:5173/CPSC319_Project/#/<VITE_STAFF_BASE>/login)

Note: To view table contents from the database, they will be printed in your browser at https://surreyfoodbank.onrender.com/api/[TABLE_NAME] (i.e., to view the contents of the `applicants` table, navigate to https://surreyfoodbank.onrender.com/api/applicants).

### Option 2: Running Locally
#### Prerequisites

IMPORTANT: All .env variables can be found in the final evaluation document. They are required when running locally to be able to contact the database, and log into the staff side of the application.

0. Requires Node.js v20+ and npm 9+. [Download here.](https://nodejs.org/en/download)
```bash
   # Check your node version with
   node -v

```

1. Clone the repository
```bash
   git clone https://github.com/annaliese8/CPSC319_Project.git
```

#### Backend Setup

2. Navigate to the backend folder
```bash
   cd surrey-foodbank/backend
```

3. Install dependencies
```bash
   npm install
```

4. Set up environment variables
```bash
echo "SUPABASE_URL=<your Supabase URL>
SUPABASE_ANON_KEY=<your Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<your Supabase service role key>" > .env
```

5. Start the backend server
```bash
   npm run dev
```
Note: To view table contents from the database, they will be printed in your browser at http://localhost:3000/api/[TABLE_NAME] (i.e., to view the contents of the `applicants` table, navigate to http://localhost:3000/api/applicants).

#### Frontend Setup

6. Leave the backend running. In a separate terminal window, navigate to the frontend folder:
```bash
   cd surrey-foodbank/frontend
```

7. Install dependencies
```bash
   npm install
```

8. Set up environment variables
```bash
echo "VITE_STAFF_BASE=<your staff URL base>
   VITE_SUPABASE_ANON_KEY=<your Supabase anon key>
   VITE_SUPABASE_URL=<your Supabase URL>
" > .env
```

9. Start the frontend server
```bash
   npm run dev
```

10. Visit the app:
   - **Applicant side:** [http://localhost:5173/CPSC319_Project/](http://localhost:5173/CPSC319_Project/)
   - **Staff side:** `http://localhost:5173/CPSC319_Project/#/<VITE_STAFF_BASE>/login` (replace <VITE_STAFF_BASE> with value from final evaluation document)

## Testing
Testing the backend: navigate to the backend folder and run:
```bash
npm run test
```

Testing the frontend: navigate to the frontend folder and run:
```bash
npm run test
```

## Development Team
Our team is named **AllCookiesNoCash**! We are creating this project as part of our CPSC 319 Software Engineering Project course at the University of British Columbia. All members of our five-person team equally contribute to development, but our official roles for the course are as follows:
| Name                   | Role |
| :--------------------- | :--------------- |
| Mehrshad Esmaeilzadeh  | Project Manager  |
| Annaliese Ferchau      | Client Liaison   |
| Ishan Singh            | QA Tester        |
| Nina Trochtchanovitch  | Graphic Designer |
| Kathrina Pillay        | Technical Writer |

## AI Disclosure
Generative AI tools were used to suggest code snippets and debugging ideas. The team reviewed all output, adapted it to our codebase, and validated it through testing and code review.
