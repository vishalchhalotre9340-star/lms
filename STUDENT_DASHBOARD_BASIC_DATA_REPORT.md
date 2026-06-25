# Student Dashboard Basic Data Report

## APIs Reused

- `lms.lms.utils.get_courses`
  - Used through the existing frontend `createListResource` pattern.
  - Called with `filters: { enrolled: 1 }`.
  - Enrollment scoping is handled server-side with the current Frappe session user.
- `LMS Certificate`
  - Used through the same `createListResource` pattern as `frontend/src/pages/ProfileCertificates.vue`.
  - Filtered by `member: userResource.data.name` from the existing current user store.
- `lms.lms.api.get_user_info`
  - Used through the existing `usersStore()` resource only.

## Files Changed

- `frontend/src/pages/Home/StudentDashboard.vue`
- `STUDENT_DASHBOARD_BASIC_DATA_REPORT.md`

## Test Result

- Confirmed Frappe is reachable through the current Vite proxy:
  - `http://127.0.0.1:8080/api/method/lms.lms.api.get_user_info` reaches Frappe and returns `403` without browser auth cookies.
- Ran the Vite app with `npm run dev`.
- Verified the dashboard route loads:
  - `http://127.0.0.1:8080/lms/student-dashboard` returned `HTTP 200`.
- Verified the dashboard Vue module compiles through Vite:
  - `http://127.0.0.1:8080/src/pages/Home/StudentDashboard.vue` returned `HTTP 200`.

## Backend/API Issues Found

- PowerShell requests do not include the logged-in browser session cookies, so authenticated API checks return `403 Forbidden`.
- Because the in-app browser connector is unavailable in this environment, I could not complete live Browser Console or Network tab inspection for separate student accounts.
- No backend Python code, permissions, routes, sidebar logic, or Vite config were changed.

## Manual Scenarios To Confirm In Browser

- Logged-in student with no enrollment:
  - My Courses: `0`
  - Progress %: `0%`
  - Continue Learning: `No enrolled courses yet.`
  - Certificates: empty-state copy if none exist
- Logged-in student with at least one enrollment:
  - My Courses: enrolled course count
  - Progress %: average of enrolled course `membership.progress`
  - Continue Learning: first incomplete course with Resume button to CourseDetail
  - Certificates: current user's certificate count
- Instructor/admin:
  - No dashboard route, sidebar, backend permission, or admin/instructor behavior was changed by this task.
