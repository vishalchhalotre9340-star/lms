# Instructor Metrics Assignment Optimization Report

## Files modified

- `lms/lms/api.py`
- `INSTRUCTOR_METRICS_ASSIGNMENT_OPTIMIZATION_REPORT.md`

## Old vs new assignment query count

Normal course-present path before this change:

- Pending Evaluations list: `LMS Assignment Submission` latest 5 `Not Graded` query.
- Pending Evaluations count: `LMS Assignment Submission` count query.
- Recent Submissions: `LMS Assignment Submission` latest 5 query.
- Instructor Notifications: `LMS Assignment Submission` latest 10 query.

Old total: 4 `LMS Assignment Submission` queries.

Normal course-present path after this change:

- Pending Evaluations list: unchanged latest 5 `Not Graded` query.
- Pending Evaluations count: unchanged count query.
- Shared latest assignment source query for Recent Submissions and Instructor Notifications.

New total: 3 `LMS Assignment Submission` queries.

## Shared source query fields

The shared source query is scoped to the current instructor's created courses and loads at most 10 latest rows ordered by `creation desc`.

Fields loaded:

- `name`
- `member_name`
- `course`
- `assignment_title`
- `creation`
- `status`

## Helper functions updated

- `_get_recent_instructor_submissions(course_names, course_titles, assignment_submission_rows)`
- `_get_instructor_notifications(course_names, course_titles, enrollment_rows, assignment_submission_rows)`

## Behavior-preservation checks

- Pending Evaluations list behavior is unchanged: same filters, fields, `creation desc` sorting, and limit 5.
- Pending Evaluations count behavior is unchanged: it still uses the existing count query and does not load every pending row into Python.
- Recent Submissions still uses the latest 5 assignment submissions, merges them with the existing quiz query results, sorts by `submitted_at` descending, and returns at most 5.
- Instructor Notifications still uses the latest 10 assignment submissions, merges them with enrollment, quiz, and certificate notifications, sorts by `created_at` descending, and returns at most 10.
- Quiz Submission, Certificate Request, Batch, and Enrollment query behavior was not modified in this task.
- API response keys, item shapes, limits, sorting, and access behavior were preserved.

## Privacy and session-scope confirmation

The shared assignment source query uses only `course_names` derived from `_get_current_user_created_courses()`, which is based on `frappe.session.user`. No frontend-provided IDs, emails, users, members, courses, submissions, or filters were introduced.

No per-row database queries were added.

## Verification result

- Confirmed expected `LMS Assignment Submission` query reduction from 4 to 3 in the instructor metrics course-present path.
- Confirmed Pending Evaluations list/count logic remains separate and unchanged.
- Confirmed no frontend files were changed.
- Confirmed no cache was added.
- Python syntax validation could not be run: native `python` and `py` commands are unavailable, and WSL has no installed distributions.
- `migrate` was not run.
