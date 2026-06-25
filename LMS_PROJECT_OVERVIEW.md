# Frappe LMS Project Overview

This report explains the cloned Frappe LMS project from a beginner-friendly technical point of view. The project is a Frappe Framework app with a Vue frontend that provides course browsing, course authoring, student enrollment, lessons, quizzes, assignments, batches, certificates, jobs, and user profiles.

## 1. Tech Stack

### Backend

- **Python**: Main backend language.
- **Frappe Framework**: Full-stack framework used for routing, database models, permissions, REST/RPC APIs, authentication, background jobs, realtime events, hooks, DocTypes, and admin/desk features.
- **MariaDB/MySQL**: Typical Frappe database backend. DocTypes are converted into database tables such as `tabLMS Course`, `tabLMS Enrollment`, and `tabLMS Quiz Submission`.
- **Redis + workers**: Used by Frappe/bench for background jobs, cache, realtime events, and scheduled tasks.
- **Frappe Payments app**: Required by this app through `required_apps = ["frappe/payments"]` in `lms/hooks.py`. Paid courses, paid batches, and paid certificates depend on it.
- **Jinja templates**: Used for website pages, emails, certificates, and macro rendering.
- **SQLite search helper**: `lms/sqlite.py` builds an LMS search index in the background.

### Frontend

- **Vue 3**: Main frontend framework.
- **Vite**: Development/build tool for the Vue frontend.
- **Frappe UI**: UI component library and resource helpers such as `createResource` and `createDocumentResource`.
- **Pinia**: State management for session, user, settings, and sidebar state.
- **Vue Router**: Client-side routes under the LMS path.
- **Tailwind CSS / PostCSS**: Styling pipeline.
- **Editor.js and rich editors**: Lesson/course content editing.
- **Socket.IO client**: Realtime updates through Frappe.
- **Vitest and Cypress**: Unit/integration and end-to-end test tooling.

### Important Package Files

- `package.json`: Root scripts. The root `dev` and `build` commands call `yarn` inside `frontend`.
- `frontend/package.json`: Frontend dependencies and scripts.
- `pyproject.toml`: Python formatting/linting/package metadata.
- `lms/hooks.py`: Frappe app registration, routes, permissions, events, scheduler jobs, and auth hooks.

## 2. Folder Structure

```text
lms-clean/
  README.md
  bench-installation.md
  package.json
  pyproject.toml
  frontend/
    package.json
    vite.config.js
    src/
      main.js
      App.vue
      router.js
      socket.js
      stores/
      pages/
      components/
      utils/
      styles/
      types/
      tests/
  lms/
    hooks.py
    auth.py
    install.py
    plugins.py
    page_renderers.py
    sqlite.py
    lms/
      api.py
      utils.py
      user.py
      doctype/
        lms_course/
        course_chapter/
        course_lesson/
        lms_enrollment/
        lms_course_progress/
        lms_quiz/
        lms_quiz_submission/
        lms_assignment/
        lms_assignment_submission/
        lms_certificate/
        lms_certificate_request/
        lms_batch/
        lms_batch_enrollment/
        lms_program/
        ...
    public/
    templates/
    www/
    fixtures/
    patches/
```

### What Each Main Area Does

- `frontend/src/main.js`: Creates the Vue app, installs Frappe UI, Pinia, router, translations, sockets, and global user/dialog helpers.
- `frontend/src/router.js`: Defines the LMS single-page app routes.
- `frontend/src/pages`: Route-level Vue pages such as courses, lessons, quizzes, batches, assignments, and profiles.
- `frontend/src/components`: Shared UI components such as layouts, course outline, modals, controls, sidebar, and lesson widgets.
- `frontend/src/stores`: Pinia stores for session, user info, settings, and sidebar.
- `lms/hooks.py`: Connects the app into Frappe. This is one of the most important backend files.
- `lms/lms/api.py`: General LMS API methods used by the frontend.
- `lms/lms/utils.py`: Shared helper methods for course details, outlines, permissions, progress, search, and LMS routes.
- `lms/lms/doctype`: Frappe DocTypes. Each folder usually contains a `.json` schema file and a `.py` controller file.
- `lms/install.py`: Creates LMS roles and default permissions after install/sync.

## 3. Frontend Flow

### App Startup

1. Browser opens the LMS route, usually `/lms`.
2. Frappe serves the SPA entry page through route rules in `lms/hooks.py`.
3. `frontend/src/main.js` mounts `App.vue`.
4. `App.vue` chooses a layout:
   - `DesktopLayout.vue` for desktop.
   - `MobileLayout.vue` for mobile.
   - `NoSidebarLayout.vue` for lesson/persona-style focused pages.
5. `router.js` controls page navigation.
6. Pinia stores load:
   - `stores/session.js`: reads `user_id` cookie and handles logout/branding.
   - `stores/user.js`: calls `lms.lms.api.get_user_info`.
   - `stores/settings.js`: calls `lms.lms.api.get_lms_settings`.

### Route Guard

`frontend/src/router.js` checks whether the user is logged in. If not logged in:

- Home redirects to courses.
- LMS settings are loaded.
- If `allow_guest_access` is disabled, the browser is sent to `/login`.

### Main Frontend Routes

- `/`: Home dashboard.
- `/courses`: Course catalog.
- `/courses/:courseName`: Course detail page.
- `/courses/:courseName/learn/:chapterNumber-:lessonNumber`: Lesson player.
- `/courses/:courseName/certification`: Certificate flow.
- `/batches`: Batch list.
- `/batches/:batchName`: Batch detail.
- `/quizzes`: Quiz management/list.
- `/quiz/:quizID`: Student quiz attempt page.
- `/quiz-submissions/:quizID`: Quiz submissions list.
- `/assignment-submission/:assignmentID/:submissionName`: Assignment submission detail.
- `/programs`: Programs.
- `/user/:username`: Profile and certificates.
- `/search`: Search page.

### Data Loading Pattern

The frontend mostly uses Frappe UI resources:

- `createResource`: Calls whitelisted Frappe methods or generic `frappe.client.*` methods.
- `createDocumentResource`: Loads and updates a single DocType document.
- `createListResource`: Used in some areas for DocType lists.

Examples:

- `CourseDetail.vue` loads a course with `lms.lms.utils.get_course_details`.
- `CourseEditor.vue` loads the outline with `lms.lms.utils.get_course_outline`.
- `CourseForm.vue` edits an `LMS Course` document with `createDocumentResource`.
- `Lesson.vue` saves progress using `lms.lms.doctype.course_lesson.course_lesson.save_progress`.
- `QuizPage.vue` submits quiz attempts through quiz APIs.

## 4. Backend Flow

### Frappe App Registration

The backend starts from `lms/hooks.py`. Important hook areas:

- App metadata: app name, title, icon, required apps.
- Install hooks: `after_install`, `after_sync`, `before_uninstall`.
- Route rules:
  - `/{lms_path}` and `/{lms_path}/<path:app_path>` route to `_lms`.
  - Certificate public route maps `/courses/<course_name>/<certificate_id>` to `certificate`.
- Permission hooks:
  - Custom permissions for certificates, batches, programs, and live classes.
- Document events:
  - Adds LMS Student role to new users.
  - Validates usernames.
  - Processes badges on document changes.
  - Publishes notifications.
- Scheduler events:
  - Rebuild search index.
  - Update course statistics.
  - Send course/batch reminders.
  - Schedule and complete evaluations.
  - Update live class attendance.
- Auth hook:
  - `lms.auth.authenticate`.

### Backend Request Flow

1. A Vue page calls a Frappe method, for example `lms.lms.utils.get_course_details`.
2. Frappe checks session and method access.
3. If `block_endpoints` is enabled, `lms/auth.py` restricts non-LMS API access for website users.
4. The whitelisted Python method runs.
5. The method uses Frappe ORM calls such as `frappe.get_doc`, `frappe.db.get_value`, `frappe.get_all`, or Query Builder.
6. Frappe serializes the result to JSON.
7. The frontend resource updates the Vue page.

### Main Backend API Files

- `lms/lms/api.py`: Large API module for user info, billing, branding, sidebar, course editor operations, batch helpers, evaluations, dashboards, video tracking, exercise submission, import/export, and settings.
- `lms/lms/utils.py`: Course details, course outline, lesson metadata, progress helpers, instructor helpers, permission helpers, LMS route helpers, and profile/search utilities.
- `lms/lms/user.py`: Signup, user role assignment, username generation, country detection, login redirect.
- `lms/auth.py`: Optional endpoint blocking logic.

## 5. Database / Models

Frappe uses **DocTypes** as both model definitions and database schema. A DocType folder usually contains:

- `doctype_name.json`: Schema fields, permissions, naming rules, links, and UI metadata.
- `doctype_name.py`: Python controller class and business rules.

### Core Course Models

- `LMS Course`
  - Main course record.
  - Fields include title, description, short introduction, image, instructors, category, published flag, pricing, certification, statistics, and chapters.
  - Controller: `lms/lms/doctype/lms_course/lms_course.py`.
- `Course Chapter`
  - A chapter inside a course.
  - Links to `LMS Course`.
  - Contains child table `Lesson Reference`.
- `Course Lesson`
  - A lesson inside a chapter.
  - Stores title, content, instructor content, markdown body, YouTube URL, quiz ID, assignment fields, and SCORM state.
- `Chapter Reference`
  - Child table used by `LMS Course` to order chapters.
- `Lesson Reference`
  - Child table used by `Course Chapter` to order lessons.
- `Course Instructor`
  - Child table used to assign instructors to courses and batches.

### Enrollment and Progress Models

- `LMS Enrollment`
  - Connects a user to a course.
  - Stores course, member, current lesson, progress, payment, purchased certificate flag, certificate, and batch source.
- `LMS Course Progress`
  - Tracks completed or partially completed lessons per member.
- `LMS Video Watch Duration`
  - Tracks watched video duration per lesson/source/member.

### Quiz and Assignment Models

- `LMS Quiz`
  - Quiz header: title, questions, marks, passing percentage, attempts, negative marking, linked course/lesson.
- `LMS Question`
  - Question bank.
- `LMS Quiz Question`
  - Child rows that connect questions to a quiz and assign marks/type.
- `LMS Quiz Submission`
  - Student quiz attempt with score, percentage, result rows, and member.
- `LMS Quiz Result`
  - Child result rows for quiz answers.
- `LMS Assignment`
  - Assignment definition.
- `LMS Assignment Submission`
  - Student answer, URL/file/text content, comments, status, evaluator, and duplicate checks.

### Certificate Models

- `LMS Certificate`
  - Issued certificate for a course or batch.
  - Validates enrollment, completion, and duplicate certificates.
- `LMS Certificate Request`
  - Student request for evaluation/certification slot.
- `LMS Certificate Evaluation`
  - Evaluator result for a certificate request.
- `Course Evaluator`
  - Evaluator profile and availability.
- `Evaluator Schedule`
  - Child rows for evaluator availability.

### Batch and Live Class Models

- `LMS Batch`
  - Cohort/batch with courses, instructors, timetable, assessments, seats, dates, payment, and live class settings.
- `LMS Batch Enrollment`
  - Connects users to batches and creates course enrollments for batch courses.
- `Batch Course`
  - Child table connecting courses to a batch.
- `LMS Batch Timetable`
  - Scheduled lessons, quizzes, assignments, or milestones.
- `LMS Live Class`
  - Zoom/Google Meet live class details.
- `LMS Live Class Participant`
  - Attendance/participant data.

### Other Important Models

- `LMS Settings`: Global LMS settings.
- `LMS Category`: Course categories.
- `LMS Payment`: LMS payment tracking.
- `LMS Coupon` and `LMS Coupon Item`: Discounts.
- `LMS Program`, `LMS Program Course`, `LMS Program Member`: Program-level grouping and progress.
- `LMS Badge` and `LMS Badge Assignment`: Badge rules and awards.
- `LMS Programming Exercise`, `LMS Test Case`, `LMS Programming Exercise Submission`: Coding exercise flow.
- `LMS Sidebar Item`: Custom sidebar entries.

## 6. Authentication System

### Login and Session

Frappe provides the main authentication system:

- Login page: usually `/login`.
- API login/logout: standard Frappe endpoints.
- Session cookie: frontend reads the `user_id` cookie in `frontend/src/stores/session.js`.
- Logged-in user info: frontend calls `lms.lms.api.get_user_info`.

### User Store

`frontend/src/stores/user.js` loads:

- User email, full name, image, username, bio, headline.
- Roles.
- Role-derived booleans:
  - `is_instructor`
  - `is_moderator`
  - `is_evaluator`
  - `is_student`
  - `is_system_manager`

### Signup

Signup logic is in `lms/lms/user.py`:

- `sign_up(email, full_name, verify_terms, user_category)` is guest-accessible.
- It checks whether signup is disabled.
- It prevents duplicate enabled users.
- It rate-limits based on Frappe system settings.
- It creates a website user.
- It adds the default portal role if configured.
- It adds the `LMS Student` role.

### Role Setup

`lms/install.py` creates the main LMS roles:

- `Course Creator`
- `Moderator`
- `Batch Evaluator`
- `LMS Student`

New users automatically receive `LMS Student` through the `User.before_insert` hook in `lms/hooks.py`.

### API Blocking

`lms/auth.py` implements optional endpoint blocking when `frappe.conf.block_endpoints` is enabled:

- System users are allowed.
- LMS endpoints are allowed.
- A defined allowlist of standard Frappe endpoints is allowed.
- Server scripts and configured custom app endpoints can be allowed.
- Other API paths are blocked for website users.

## 7. Course Creation Flow

### Frontend Flow

1. Instructor or moderator opens `/courses`.
2. `Courses.vue` shows course catalog and creation controls.
3. `NewCourseModal.vue` collects:
   - Title
   - Category
   - Instructors
   - Thumbnail
   - Short introduction
   - Description
4. The modal inserts an `LMS Course` document through the course list resource.
5. On success, the user is redirected to `/courses/:courseName#settings`.
6. `CourseDetail.vue` loads course details with `lms.lms.utils.get_course_details`.
7. `CourseForm.vue` edits course metadata using `createDocumentResource` for `LMS Course`.
8. `CourseEditor.vue` manages chapters and lessons.
9. `CourseOutline.vue` loads and reorders chapters/lessons through:
   - `lms.lms.utils.get_course_outline`
   - `lms.lms.api.update_lesson_index`
   - `lms.lms.api.update_chapter_index`
   - `lms.lms.api.delete_lesson`
   - `lms.lms.api.delete_chapter`
10. `LessonForm.vue` edits individual lessons.
11. Moderator can publish/unpublish from `CourseDetail.vue` using `frappe.client.set_value` on `LMS Course.published`.

### Backend Flow

`LMSCourse.validate()` in `lms/lms/doctype/lms_course/lms_course.py` runs business rules:

- Sets `published_on` when the course is published.
- Adds the owner as instructor on new courses if no instructor exists.
- Normalizes YouTube video links.
- Sets status to `Approved` when published.
- Checks that the Payments app exists for paid courses.
- Validates paid certificate and completion certificate settings.
- Validates amount/currency for paid courses/certificates.
- Assigns a card gradient if no image exists.

### Permission Flow

Course modification is protected by role and instructor checks:

- Moderators can manage courses.
- Course creators can manage courses they instruct.
- Utility function `can_modify_course()` in `lms/lms/utils.py` is used by many API methods.

## 8. Student Enrollment Flow

### Self Enrollment

The course detail page decides whether a student can enroll based on course details returned from `get_course_details`.

Typical flow:

1. Student opens a published course.
2. If the course is free and self-learning is enabled, the frontend creates an `LMS Enrollment`.
3. If the course is paid, the student is sent through billing/payment first.
4. When enrollment is created, `LMSEnrollment.before_insert()` validates it.
5. Student can then open lessons.

### Admin Enrollment

`CourseEnrollmentModal.vue` lets an admin/instructor enroll a selected student:

1. Select student.
2. Optionally mark purchased certificate and select payment.
3. Insert `LMS Enrollment` through `frappe.client.insert`.
4. Reload student list.

### Enrollment Validation

`lms/lms/doctype/lms_enrollment/lms_enrollment.py` validates:

- Duplicate enrollment is not allowed for the same course/member.
- Owner is set to the member so the student can update progress.
- Unpublished courses cannot be joined by normal students.
- Courses with `disable_self_learning` cannot be self-enrolled by normal students.
- Paid courses require a received `LMS Payment`.
- Batch-created enrollments must match a course attached to that batch.

### Batch Enrollment

`LMS Batch Enrollment` handles cohort enrollment:

- Validates duplicate member in batch.
- Validates payment for paid batches.
- Validates seat availability.
- Validates whether self-enrollment is allowed.
- Automatically creates `LMS Enrollment` rows for all courses in the batch.
- Adds the member to existing live class events.
- Sends enrollment confirmation email if email is configured.

## 9. Quiz / Lesson / Certificate Flow

### Lesson Flow

1. Student opens `/courses/:courseName/learn/:chapterNumber-:lessonNumber`.
2. `Lesson.vue` loads lesson details from backend utility methods.
3. Lesson content can include:
   - Text/rich content
   - YouTube/video
   - Quiz blocks
   - Assignment blocks
   - Programming exercise blocks
   - SCORM content
4. When the student completes the lesson, the frontend calls:
   - `lms.lms.doctype.course_lesson.course_lesson.save_progress`
5. Backend checks enrollment and updates:
   - `LMS Enrollment.current_lesson`
   - `LMS Course Progress`
   - `LMS Enrollment.progress`
6. Backend publishes realtime event `update_lesson_progress`.

### Lesson Completion Rules

`save_progress()` checks embedded assessments before marking a lesson complete:

- If quiz enforcement is enabled, all embedded quizzes must have passing submissions.
- If assignment enforcement is enabled, required assignments must have submissions.
- SCORM lessons can be marked complete or partially complete based on SCORM details.

The settings are read from `LMS Settings`:

- `enforce_quiz_completion`
- `enforce_assignment_completion`

### Quiz Flow

1. Instructor creates an `LMS Quiz`.
2. Quiz contains child `LMS Quiz Question` rows linked to `LMS Question`.
3. Lesson content can reference a quiz.
4. Student opens quiz page or embedded quiz.
5. Frontend submits answers to `lms.lms.doctype.lms_quiz.lms_quiz.submit_quiz`.
6. Backend:
   - Loads quiz details.
   - Checks each answer.
   - Handles choice, multiple-choice, user input, and open-ended questions.
   - Applies negative marking if enabled.
   - Creates `LMS Quiz Submission`.
   - Calculates score and percentage in `LMSQuizSubmission.validate()`.
   - Calls `save_progress_after_quiz()` if the quiz is linked to a lesson/course and the score passes.
7. Quiz submissions can notify members when scores are updated.

### Assignment Flow

1. Instructor creates an `LMS Assignment`.
2. Lesson content can include assignment blocks.
3. Student submits through `LMS Assignment Submission`.
4. Backend validates:
   - Student can only submit for themselves unless privileged.
   - Duplicate assignment submissions are blocked.
   - URL answers must be valid.
   - Private embedded images are attached to the submission document.
5. Instructor/evaluator comments or status changes notify the student.

### Certificate Flow

There are two main certificate paths.

#### Completion Certificate

1. Course has `enable_certification` enabled.
2. Student completes the course.
3. Frontend calls `lms.lms.doctype.lms_certificate.lms_certificate.create_certificate`.
4. Backend checks:
   - Student is enrolled.
   - Certification is enabled.
   - Course progress is 100%.
   - No duplicate certificate exists.
5. `LMS Certificate` is created.
6. Certificate email is sent if outgoing email is configured.

#### Paid / Evaluated Certificate

1. Course can have `paid_certificate` and an evaluator.
2. Student buys the certificate or schedules an evaluation.
3. `LMS Certificate Request` validates evaluator, slot, date/time, timezone, and duplicate requests.
4. Calendar event or Google Meet can be created if configured.
5. Evaluator records evaluation details.
6. Certificate is issued after passing the relevant process.

### Certificate Validation

`LMSCertificate.validate()` checks:

- Course or batch is present unless the user is privileged.
- Member is enrolled in the course/batch.
- Completion certificate requires 100% course progress.
- Duplicate certificate is blocked for the same member/course or member/batch.

## 10. How to Run Locally

This project is a Frappe app, so the correct local setup is through **bench**, not only `npm`.

### Recommended Local Setup

1. Install prerequisites:
   - Python
   - Node.js
   - Yarn
   - Redis
   - MariaDB/MySQL
   - wkhtmltopdf if needed by Frappe
   - Frappe Bench

2. Create or use a bench:

```bash
bench init frappe-bench
cd frappe-bench
```

3. Get required apps:

```bash
bench get-app https://github.com/frappe/payments
bench get-app https://github.com/frappe/lms
```

If you are using this cloned folder as the app source, place or symlink it inside `frappe-bench/apps/lms`.

4. Create a site:

```bash
bench new-site learning.test
bench --site learning.test add-to-hosts
```

5. Install the LMS app:

```bash
bench --site learning.test install-app lms
```

6. Start Frappe:

```bash
bench start
```

7. Open:

```text
http://learning.test:8000/lms
```

### Docker Setup From README

The README also documents a Docker setup:

```bash
mkdir frappe-learning
cd frappe-learning
wget -O docker-compose.yml https://raw.githubusercontent.com/frappe/lms/develop/docker/docker-compose.yml
wget -O init.sh https://raw.githubusercontent.com/frappe/lms/develop/docker/init.sh
docker compose up -d
```

Then open:

```text
http://lms.localhost:8000/lms
```

Default credentials from README:

- Username: `Administrator`
- Password: `admin`

### Frontend-Only Development

The frontend has its own Vite app in `frontend/`.

```bash
cd frontend
yarn install
yarn dev
```

or, if using npm directly:

```bash
cd frontend
npm install
npm run dev
```

However, the frontend still expects a running Frappe backend for APIs, sessions, DocTypes, permissions, files, and realtime features. A standalone Vite server is not enough for the full LMS.

### Note About This Clone

The root `package.json` uses `yarn`:

```json
"dev": "cd frontend && yarn dev"
```

If `yarn` is not installed, `npm run dev` from the root will fail with `yarn is not recognized`. Install Yarn or run frontend scripts directly with npm from `frontend/`.

## 11. Important Files to Study First

Study these in order:

1. `README.md`
   - High-level project purpose, features, and setup.

2. `lms/hooks.py`
   - Frappe app wiring: routes, permissions, scheduler jobs, auth hooks, Jinja helpers, document events.

3. `frontend/src/main.js`
   - Vue app initialization.

4. `frontend/src/App.vue`
   - Layout selection and global app shell.

5. `frontend/src/router.js`
   - Frontend routes and login/guest access behavior.

6. `frontend/src/stores/session.js`
   - Session cookie reading, logout, branding.

7. `frontend/src/stores/user.js`
   - Current user loading and authentication error handling.

8. `frontend/src/stores/settings.js`
   - LMS settings and sidebar/settings resources.

9. `lms/lms/api.py`
   - Most frontend-facing backend API methods.

10. `lms/lms/utils.py`
   - Course details, course outline, progress, permissions, and helper logic.

11. `lms/lms/user.py`
   - Signup, LMS Student role assignment, login redirect.

12. `lms/auth.py`
   - Optional API endpoint blocking.

13. `lms/install.py`
   - Role creation and installation-time permissions.

14. `lms/lms/doctype/lms_course/lms_course.json`
   - Course schema.

15. `lms/lms/doctype/lms_course/lms_course.py`
   - Course validation and publishing rules.

16. `lms/lms/doctype/course_chapter/course_chapter.json`
   - Chapter schema.

17. `lms/lms/doctype/course_lesson/course_lesson.json`
   - Lesson schema.

18. `lms/lms/doctype/course_lesson/course_lesson.py`
   - Lesson progress, quiz/assignment gating, SCORM progress.

19. `lms/lms/doctype/lms_enrollment/lms_enrollment.json`
   - Enrollment schema.

20. `lms/lms/doctype/lms_enrollment/lms_enrollment.py`
   - Enrollment validation and program progress updates.

21. `lms/lms/doctype/lms_quiz/lms_quiz.py`
   - Quiz validation, answer checking, submission creation.

22. `lms/lms/doctype/lms_quiz_submission/lms_quiz_submission.py`
   - Quiz scoring, percentage, max attempts, notifications.

23. `lms/lms/doctype/lms_assignment_submission/lms_assignment_submission.py`
   - Assignment submission validation.

24. `lms/lms/doctype/lms_certificate/lms_certificate.py`
   - Certificate creation and validation.

25. `lms/lms/doctype/lms_certificate_request/lms_certificate_request.py`
   - Evaluation scheduling.

26. `lms/lms/doctype/lms_batch/lms_batch.py`
   - Batch validation, live classes, reminders.

27. `lms/lms/doctype/lms_batch_enrollment/lms_batch_enrollment.py`
   - Batch enrollment and automatic course enrollment.

28. `frontend/src/pages/Courses/Courses.vue`
   - Course catalog.

29. `frontend/src/pages/Courses/NewCourseModal.vue`
   - New course creation UI.

30. `frontend/src/pages/Courses/CourseDetail.vue`
   - Main course detail screen and tabs.

31. `frontend/src/pages/Courses/CourseForm.vue`
   - Course metadata editing.

32. `frontend/src/pages/Courses/CourseEditor.vue`
   - Chapter/lesson authoring shell.

33. `frontend/src/components/CourseOutline.vue`
   - Course outline, lesson ordering, chapter operations.

34. `frontend/src/pages/Lesson.vue`
   - Student lesson player and progress calls.

35. `frontend/src/pages/QuizPage.vue`
   - Student quiz attempt UI.

36. `frontend/src/pages/Courses/CourseCertification.vue`
   - Certificate UI flow.

## Beginner Mental Model

Think of this LMS as four layers:

1. **Frappe DocTypes are the database models.**
   - Example: `LMS Course`, `Course Lesson`, `LMS Enrollment`.

2. **Python controller files hold business rules.**
   - Example: `lms_course.py` validates publishing and payments.
   - Example: `lms_enrollment.py` blocks duplicate or invalid enrollments.

3. **Whitelisted Python methods are the API.**
   - Example: `get_course_details`, `get_course_outline`, `save_progress`, `submit_quiz`.

4. **Vue pages call those APIs and render the LMS experience.**
   - Example: `CourseDetail.vue`, `CourseEditor.vue`, `Lesson.vue`, `QuizPage.vue`.

If you understand those four layers, the rest of the project becomes much easier to navigate.
