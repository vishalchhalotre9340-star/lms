# Pending Work Endpoint Implementation Report

## Files Changed

- `lms/lms/api.py`
  - Added `lms.lms.api.get_my_pending_work`.
  - Added private helper functions for enrolled-course scoping, lesson assessment extraction, pending quiz calculation, and pending assignment calculation.

No frontend files were intentionally changed.

## Endpoint Path

Python method:

```text
lms.lms.api.get_my_pending_work
```

HTTP API path:

```text
/api/method/lms.lms.api.get_my_pending_work
```

## Security Rules Implemented

- The endpoint accepts no arguments.
- Guest users are rejected with `frappe.PermissionError`.
- The current learner is always resolved from:

```python
frappe.session.user
```

- Enrolled courses are resolved only from `LMS Enrollment` rows where:

```python
member = frappe.session.user
```

- Quiz and assignment candidates are collected only from lessons belonging to those enrolled courses.
- Quiz submissions are read only for:

```python
member = frappe.session.user
quiz in enrolled_course_lesson_quizzes
```

- Assignment submissions are read only for:

```python
member = frappe.session.user
assignment in enrolled_course_lesson_assignments
```

- No `member`, `student`, `user`, `course`, `quiz`, or `assignment` parameter is accepted from the frontend.
- Existing instructor/admin assessment APIs were not modified.
- Existing instructor/admin assessment APIs were not reused directly because they accept a frontend-provided `member`.

## Completion Rules Implemented

### Pending Quiz

A quiz is pending when:

- The quiz appears in a lesson for one of the current user's enrolled courses.
- The current user has no passing `LMS Quiz Submission`.

Passing follows the existing lesson-completion rule:

```python
percentage >= passing_percentage
```

The implementation also preserves the existing behavior for quizzes with `passing_percentage = 0`: a quiz still requires an actual submission before it can be treated as complete.

Duplicate quiz references are deduplicated by quiz name.

### Pending Assignment

An assignment is pending when:

- The assignment appears in a lesson for one of the current user's enrolled courses.
- The current user has no `LMS Assignment Submission`.

This matches the existing lesson-completion rule, where any assignment submission counts as complete.

Duplicate assignment references are deduplicated by assignment name.

## Response Shape

The endpoint returns:

```json
{
  "pending_quiz_count": 0,
  "pending_assignment_count": 0,
  "quizzes": [],
  "assignments": []
}
```

Pending quiz rows include:

- `quiz`
- `title`
- `course`
- `course_title`
- `lesson`
- `lesson_title`
- `status`
- `best_percentage`
- `passing_percentage`
- `due_date`
- `route`

Pending assignment rows include:

- `assignment`
- `title`
- `course`
- `course_title`
- `lesson`
- `lesson_title`
- `status`
- `submission`
- `due_date`
- `route`

`due_date` is currently returned as `null` because the existing quiz and assignment DocTypes do not expose due date fields.

## Test Commands And Results

### Guest rejection through Frappe backend

Command:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/method/lms.lms.api.get_my_pending_work' -UseBasicParsing -TimeoutSec 15
```

Result:

```text
STATUS=417
ERROR=The remote server returned an error: (417) EXPECTATION FAILED.
```

Interpretation:

- The backend endpoint is reachable.
- Guest access is rejected.

### Guest rejection through Vite proxy

Command:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8080/api/method/lms.lms.api.get_my_pending_work' -UseBasicParsing -TimeoutSec 15
```

Result:

```text
STATUS=417
ERROR=The remote server returned an error: (417) EXPECTATION FAILED.
```

Interpretation:

- The endpoint is reachable through the current local proxy path.
- Guest access is rejected.

### Python syntax check

Command:

```powershell
python -m py_compile lms/lms/api.py
```

Result:

```text
python : The term 'python' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

Follow-up command:

```powershell
py -3 -m py_compile lms/lms/api.py
```

Result:

```text
py : The term 'py' is not recognized as the name of a cmdlet, function, script file, or operable program.
```

### Bench availability

Command:

```powershell
Get-Command bench -ErrorAction SilentlyContinue
```

Result:

```text
No bench command was available on PATH.
```

### Authenticated student scenarios

The following requested cases could not be executed from this shell because there was no available `bench` command, Python launcher, authenticated browser-control tool, or session cookie:

- student with no enrollment
- student with enrolled course and no submissions
- quiz with passing submission
- assignment with submission

The endpoint logic was implemented specifically for these cases, but the authenticated runtime checks remain to be run in an environment with either bench access or a logged-in student session.

## Migration

`bench migrate` was not run because no schema changes were made.

## Frontend Change Confirmation

No frontend files were edited for this task.

The implementation did not modify:

- `frontend/src/pages/Home/StudentDashboard.vue`
- `frontend/src/router.js`
- sidebar logic
- `frontend/vite.config.js`

## Limitations And Assumptions

- Lesson assessment extraction supports current Editor.js quiz and assignment blocks.
- Quiz extraction also supports quizzes attached to upload/video blocks, matching existing lesson completion behavior.
- Legacy Markdown macros are supported when a lesson has no Editor.js content, matching existing lesson completion behavior.
- Due dates are returned as `null` because no due date fields were found in the relevant existing DocTypes.
- Assignments with any submission are considered complete, even if status is `Not Graded` or `Fail`, because that is the current lesson progress rule.

