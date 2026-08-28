# Student Result Management System (SRMS)

A beginner-friendly, frontend-only Student Result Management System developed as a Diploma in Information Technology (DIT) final-semester project. The application manages student profiles and examination results using **HTML5, CSS3, Vanilla JavaScript, and browser LocalStorage**.

> This project is designed for educational demonstration. It does not provide production-grade authentication, backend storage, or institutional security.

## Topics / tags

`student-result-management` `srms` `dit-project` `html5` `css3` `vanilla-javascript` `localstorage` `crud-application` `dashboard` `result-management` `responsive-web-design`

## Features

The application includes a demonstration login screen, a responsive dashboard, student CRUD operations, result CRUD operations, validation, search, filters, automatic calculations, grade distribution, recent-record panels, linked student/result records, printable result cards, and safe empty states.

### Student management

- Add new student profiles.

- Edit existing student profiles.

- Delete students after confirmation.

- Prevent duplicate Student IDs and roll numbers.

- Validate names, dates of birth, gender, and Pakistani mobile numbers.

- Search by student name, Student ID, or roll number.

- Filter by class and section.

- View complete student details in a modal.

- Persist records in browser LocalStorage.

### Result management

- Select an existing student from the student directory.

- Enter an examination session.

- Enter marks for English, Mathematics, Computer, Physics, and Urdu.

- Validate marks from 0 to 100.

- Prevent duplicate results for the same student and session.

- Edit and delete stored results.

- Search by student name, Student ID, roll number, or result ID.

- Filter by session, grade, and PASS/FAIL status.

- View a dynamic printable result card.

### Automatic calculations

The system uses five subjects with a maximum of 100 marks per subject.

```
Total Marks = English + Mathematics + Computer + Physics + Urdu
Percentage = Obtained Marks / 500 × 100
```

| Percentage | Grade |
| --- | --- |
| 90–100 | A+ |
| 80–89.99 | A |
| 70–79.99 | B |
| 60–69.99 | C |
| 50–59.99 | D |
| Below 50 | F |

A result is marked **PASS** only when the percentage is at least 50% and every subject mark is at least 40. If either condition is not satisfied, the result is marked **FAIL**.

### Dashboard analytics

The dashboard dynamically displays total students, total results, passed results, failed results, pass percentage, average percentage, recent students, recent results, and a CSS-based grade distribution. No external chart library is used.

## Technology stack

| Technology | Purpose |
| --- | --- |
| HTML5 | Page structure, forms, tables, labels, and semantic layout |
| CSS3 | Visual design, responsive layout, badges, cards, tables, and print styles |
| Vanilla JavaScript | DOM interaction, validation, calculations, filtering, CRUD, and rendering |
| LocalStorage | Browser-based JSON persistence for students, results, and settings |

The project intentionally does not use React, Vue, Angular, Node.js, Bootstrap, Tailwind, Chart.js, or any other external frontend framework or chart library.

## Project structure

```
student-result-management/
├── index.html                         # Welcome and demonstration login
├── dashboard.html                     # Dynamic statistics and analytics
├── students.html                      # Student directory and CRUD actions
├── add-student.html                   # Add/edit student form
├── results.html                       # Result directory and filters
├── add-result.html                    # Add/edit result form
├── view-result.html                   # Printable result-card view
├── search-result.html                 # Focused result search page
├── css/
│   └── style.css                      # Shared design system and responsive CSS
├── js/
│   ├── app.js                         # Shared navigation, login, toast, and print behavior
│   ├── storage.js                     # LocalStorage and CRUD helper layer
│   ├── students.js                    # Student management module
│   ├── results.js                     # Result management and calculation module
│   └── dashboard.js                   # Dashboard statistics and grade distribution
├── assets/                            # Project visual assets
├── thesis-assets/                     # Screenshots, code images, and diagrams
├── thesis-cover/                      # A4 thesis cover and editable Word cover
├── SRMS_DIT_Final_Project_Report.pdf  # Final thesis report, if included
└── testing-notes.md                   # Browser and structural testing notes
```

## How to run locally

This is a static frontend project and does not require a build step or package installation.

### Open directly in a browser

1. Download or clone this repository.

1. Open `index.html` in a modern browser.

1. Use the demonstration credentials:

```
Username: admin
Password: admin123
```

The application stores its demo and user-created records in the current browser's LocalStorage.
The project does not require Node.js, npm, or a framework build command.

## LocalStorage keys

| Key | Stored data |
| --- | --- |
| `students` | Array of student profile objects |
| `results` | Array of result objects linked by `studentId` |
| `settings` | Reserved settings object |

To reset the demonstration data, clear the site's LocalStorage in the browser's Developer Tools and reload the application. The first-use demo records will be seeded again.

## Demo data

The included fictional dataset contains six students and six results for examination session 2026. The clean demo dashboard shows five passed results and one failed result. The data is fictional and is included only for interface demonstration and testing.

## Testing completed

The project was tested through browser interaction and source checks, including:

- Demonstration login and navigation.

- Student add, edit, delete, search, filtering, and duplicate prevention.

- Student validation and empty states.

- Result add, edit, delete, search, filtering, and duplicate prevention.

- Five-subject calculations and PASS/FAIL threshold behavior.

- Dashboard statistics and grade distribution.

- LocalStorage persistence after refresh.

- Printable result-card rendering.

- Desktop, tablet, and mobile responsive layouts.

- Structural HTML checks, local-link checks, and prohibited-framework scans.

Supporting testing notes are available in `testing-notes.md`, `testing-validation.txt`, and `phase5-verification.md` when included in the repository.

## Limitations

This project is an educational frontend prototype. The demonstration login is not secure authentication. LocalStorage data belongs only to the current browser profile and can be inspected, modified, or removed by the browser user. The application has no server-side database, cloud synchronization, multi-user access, role-based permissions, audit log, email delivery, or built-in PDF-generation service. The Print Result control invokes the browser's print dialog.

## Future enhancements

Possible future improvements include a secure backend API, a database, hashed authentication, role-based access, cloud synchronization, backup and restore, configurable subjects, attendance management, built-in PDF export, email notifications, and student or parent portals.

## Academic project information

| Item | Information |
| --- | --- |
| Project | Student Result Management System |
| Programme | Diploma in Information Technology (DIT ) |
| Institute | Government College of Technology Peshawar |
| Board | Khyber Pakhtunkhwa Board of Technical and Commerce Education Peshawar |
| Application type | Frontend-only browser application |
| Storage | Browser LocalStorage |

## License

This project is provided for educational and academic demonstration purposes. If you want to publish it under a specific open-source license, add the corresponding license file, such as MIT, after confirming that it matches your academic and institutional requirements.

## Author

Diploma in Information Technology (DIT)Government College of Technology Peshawar
