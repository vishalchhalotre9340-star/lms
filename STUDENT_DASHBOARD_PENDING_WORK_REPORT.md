# Student Dashboard Pending Work Report

## Files Changed

- `frontend/src/pages/Home/StudentDashboard.vue`
- `STUDENT_DASHBOARD_PENDING_WORK_REPORT.md`

No backend Python files were changed for this integration step.

The following files were not modified:

- `frontend/src/router.js`
- sidebar logic
- `frontend/vite.config.js`
- existing instructor/admin assessment APIs

## API Used

The dashboard now uses:

```text
lms.lms.api.get_my_pending_work
```

The Frappe resource sends no parameters.

It does not send:

- user ID
- member ID
- course ID
- quiz ID
- assignment ID

The backend remains responsible for identifying the learner through `frappe.session.user`.

## UI Behavior

### Pending Quizzes

The `Pending Quizzes` card now shows:

- `pending_quiz_count` from the API
- the first pending quiz title when available
- a `View` link using the API-provided `route`
- empty state: `No pending quizzes`
- loading state for the pending-work API
- error state: `Unable to load pending quizzes.`

### Pending Assignments

The `Pending Assignments` card now shows:

- `pending_assignment_count` from the API
- the first pending assignment title when available
- a `View` link using the API-provided `route`
- empty state: `No pending assignments`
- loading state for the pending-work API
- error state: `Unable to load pending assignments.`

The `View` links use plain `href` links instead of Vue Router links because the API-provided routes already include the LMS base path, for example `/lms/quiz/...`.

## Exact Test Results

### Dashboard route over Vite

Command:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8080/lms/student-dashboard' -UseBasicParsing -TimeoutSec 10
```

Initial result:

```text
STATUS=200
```

The route returned the Vite app HTML.

Later repeat checks timed out, which suggests the local dev/proxy process became unresponsive during testing.

### Frontend build

Command:

```powershell
npm.cmd run build
```

Result:

```text
'yarn' is not recognized as an internal or external command
```

Fallback command:

```powershell
npm.cmd exec vite build -- --base=/assets/lms/frontend/
```

Result:

```text
Timed out after 2 minutes with no error output.
Timed out again after 5 minutes with no error output.
```

### Endpoint as logged-in student

Not completed from this shell.

Reason:

- The browser console supplied during testing shows Frappe rejected the session/login:

```text
login:1 Failed to load resource: the server responded with a status of 401 (UNAUTHORIZED)
frappe.exceptions.AuthenticationError
Invalid login credentials
```

This means the pending-work endpoint could not be verified as a logged-in student in that browser session.

### No pending work

Not completed from this shell because the local authenticated student session was not available.

Expected UI:

- `Pending Quizzes`: count `0`, `No pending quizzes`
- `Pending Assignments`: count `0`, `No pending assignments`

### At least one pending quiz

Not completed from this shell because the local authenticated student session was not available.

Expected UI:

- `Pending Quizzes`: API count
- first pending quiz title
- `View` link to the API-provided quiz route

### At least one pending assignment

Not completed from this shell because the local authenticated student session was not available.

Expected UI:

- `Pending Assignments`: API count
- first pending assignment title
- `View` link to the API-provided assignment route

### API error fallback

The component includes card-level API error fallback states for pending work.

Runtime error-state verification was not completed because the dev/proxy process became unresponsive during follow-up HTTP checks.

## Issues Found

The pasted browser console errors are not caused by the pending-work card rendering itself:

- `login:1 401 (UNAUTHORIZED)` and `frappe.AuthenticationError` indicate invalid login credentials or an unauthenticated Frappe session.
- `website_script.js 404` is a separate missing asset request from the Frappe page shell.
- `initHighlighting() is deprecated` is a highlight.js deprecation warning and unrelated to this dashboard change.
- The content-script and AdUnit messages appear to come from a browser extension or injected script, not this LMS code.

The dashboard pending-work integration requires a valid logged-in pure student session before the endpoint can return student-scoped data.

