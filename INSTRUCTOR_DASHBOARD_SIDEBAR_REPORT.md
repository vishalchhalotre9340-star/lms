# Instructor Dashboard Sidebar Report

## Files Changed

- `frontend/src/utils/index.js`
- `INSTRUCTOR_DASHBOARD_SIDEBAR_REPORT.md`

No changes were made to:

- `frontend/src/pages/Home/InstructorDashboard.vue`
- `frontend/src/pages/Home/StudentDashboard.vue`
- `frontend/src/router.js`
- sidebar renderer components
- backend Python files
- `frontend/vite.config.js`

## Sidebar Item Added

```js
{
	label: 'Instructor Dashboard',
	icon: 'LayoutDashboard',
	to: 'InstructorDashboard',
	activeFor: ['InstructorDashboard'],
}
```

## Exact Visibility Condition

```js
userResource?.data?.is_instructor === true ||
userResource?.data?.is_moderator === true
```

The link is generated through `getSidebarLinks()`, so desktop and mobile navigation follow the same visibility rule wherever they use that helper.

Existing Student Dashboard sidebar logic was left unchanged.

## Expected Links By Role

### Instructor

`Instructor Dashboard` is visible.

Expected key links include:

- Home
- Instructor Dashboard
- Courses
- Batches
- Quizzes
- Assignments

### Moderator

`Instructor Dashboard` is visible.

Expected key links include:

- Home
- Instructor Dashboard
- Courses
- Batches
- Quizzes
- Assignments

### Pure Student

`Instructor Dashboard` is hidden.

Expected student-filtered links remain:

- Dashboard
- Courses
- Batches

### Evaluator Only

`Instructor Dashboard` is hidden.

Existing evaluator links remain unchanged.

## Route URL

```text
http://127.0.0.1:8080/lms/instructor-dashboard
```

## Test Result

### Mocked sidebar visibility check

Command executed with mocked `userResource.data` role flags against `getSidebarLinks(false)`.

Result:

```text
Instructor: visible | Home, Search, Notifications, Instructor Dashboard, Courses, Programs, Batches, Certifications, Jobs, Statistics, Quizzes, Assignments, Programming Exercises
Moderator: visible | Home, Search, Notifications, Instructor Dashboard, Courses, Programs, Batches, Certifications, Jobs, Statistics, Quizzes, Assignments, Programming Exercises
Pure student: hidden | Dashboard, Courses, Batches
Evaluator only: hidden | Home, Search, Notifications, Courses, Batches, Certifications, Jobs, Statistics, Quizzes, Assignments, Programming Exercises
```

### Route availability check

Command:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8080/lms/instructor-dashboard' -UseBasicParsing -TimeoutSec 15
```

Result:

```text
STATUS=200
```

