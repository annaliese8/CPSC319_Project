README.md

# Surrey Food Bank Appointment and Registration System

## Project Description
This web application allows prospective clients of The Surrey Food bank to book a registration appointment, and staff to manage the appointments.

## Features
Click below to watch a video that demonstrates the main features of our application!
[![Watch the video](https://img.youtube.com/vi/QumKEPrSS0Y/0.jpg)](https://www.youtube.com/watch?v=QumKEPrSS0Y)

### Applicants can...
- view registration instructions on the account creation page in five supported languages
- create an account to save registration progress and continue at any time
- reset their password if they forget their login credentials
- fill out a questionnaire form with basic information
- be redirected to alternate resources if they are ineligible due to their age, address, or status in Canada
- add information about additional members in their household
- book an appointment up to two weeks in advance, with the length depending on their household size
- reschedule or cancel their appointments
- edit their registration form responses
- receive a confirmation email whenever their appointment is booked, rescheduled, or cancelled
- visit the application on their computer or cellphone browsers
### Staff can...
- access the application through a secure login portal
- easily view and manage appointments on a weekly-view calendar
- book, modify, and cancel appointments on behalf of applicants
- view and edit the status of appointments (eg. checked-in, no show, etc.)
- browse and search through a database of registered applicants
- export appointment data as a .xslx file to view in Excel
- block appointment time slots to mark unavailability
- configure the opening days and hours

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
| Email       | MailGun & Supabase               |

## Quick Start

### Assumptions:
- The staff login credentials are in the handover document.
- When running locally, you will need keys for the .env that allow you to connect to the Supabase database and MailGun client.
- Running locally works on macOS, Windows, and Linux. No OS‑specific version requirements. 

### Option 1: Visit the Deployed App
The app is hosted on GitHub Pages.

The applicant side of the application can be accessed here:
[https://annaliese8.github.io/CPSC319_Project/](https://annaliese8.github.io/CPSC319_Project/)

To access the staff side of the application, copy the following link and replace <VITE_STAFF_BASE> with the value specified in the handover document: [http://localhost:5173/CPSC319_Project/#/<VITE_STAFF_BASE>/login](http://localhost:5173/CPSC319_Project/#/<VITE_STAFF_BASE>/login)

Note: To view table contents from the database, they will be printed in your browser at https://surreyfoodbank.onrender.com/api/[TABLE_NAME] (i.e., to view the contents of the `applicants` table, navigate to https://surreyfoodbank.onrender.com/api/applicants).

### Option 2: Running Locally

Click below to watch a detailed tutorial on how to set up the project locally:
[![Watch the video](https://img.youtube.com/vi/SoSzSr46Vf4/0.jpg)](https://www.youtube.com/watch?v=SoSzSr46Vf4)

#### Prerequisites

IMPORTANT: You will need keys for the .env files that allow you to connect to the Supabase database and MailGun client. They are required when running locally to be able to contact the database, send emails, and log into the staff side of the application.

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

4. Set up the environment variables by running the command below, opening the newly created .env file, and replacing the placeholder values with your actual credentials.
```bash
   cp .env.example .env
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

8. Set up the environment variables by running the command below, opening the newly created .env file, and replacing the placeholder values with your actual credentials.
```bash
   cp .env.example .env
```

9. Start the frontend server
```bash
   npm run dev
```

10. Visit the app:
   - **Applicant side:** [http://localhost:5173/CPSC319_Project/](http://localhost:5173/CPSC319_Project/)
   - **Staff side:** `http://localhost:5173/CPSC319_Project/#/<VITE_STAFF_BASE>/login` (replace <VITE_STAFF_BASE> with value from the handover document)

## Testing
To test the backend locally, navigate to the backend folder and run:
```bash
npm run test
```

To test the frontend locally, navigate to the frontend folder and run:
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
