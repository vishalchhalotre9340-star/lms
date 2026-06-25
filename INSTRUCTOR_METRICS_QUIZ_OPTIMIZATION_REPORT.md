# Instructor Metrics Quiz Optimization Report

## Files modified

- `lms/lms/api.py`
- `INSTRUCTOR_METRICS_QUIZ_OPTIMIZATION_REPORT.md`

## Old vs new quiz query count

Normal course-present path before this change:

- Course Performance: complete scoped `LMS Quiz Submission` query for per-course average score.
- Recent Submissions: latest 5 `LMS Quiz Submission` query.
- Instructor Notifications: latest 10 `LMS Quiz Submission` query.

Old total: 3 `LMS Quiz Submission` queries.

Normal course-present path after this change:

- Course Performance: unchanged complete scoped `LMS Quiz Submission` query.
- Shared latest quiz source query for Recent Submissions and Instructor Notifications.

New total: 2 `LMS Quiz Submission` queries.

## Shared source query fields

The shared latest quiz source query is scoped to the current instructor's created courses and loads at most 10 latest rows ordered by `creation desc`.

Fields loaded:

- `name`
- `member_name`
- `course`
- `quiz_title`
- `creation`
- `percentage`
- `passing_percentage`

## Helper functions updated

- `_get_recent_instructor_submissions(course_names, course_titles, assignment_submission_rows, quiz_submission_rows)`
- `_get_instructor_notifications(course_names, course_titles, enrollment_rows, assignment_submission_rows, quiz_submission_rows)`

## Behavior-preservation checks

- Course Performance remains unchanged and still uses the complete scoped quiz submission dataset for per-course average score.
- Recent Submissions still uses the latest 5 quiz rows, merges them with assignment rows, sorts by `submitted_at` descending, and returns at most 5.
- Instructor Notifications still uses the latest 10 quiz rows, merges them with enrollment, assignment, and certificate notifications, sorts by `created_at` descending, and returns at most 10.
- API response keys, item shapes, sorting, limits, and access behavior were preserved.
- Enrollment, Assignment Submission, Certificate Request, and Batch query behavior was not modified in this task.

## Privacy and session-scope confirmation

The shared quiz source query uses only `course_names` derived from `_get_current_user_created_courses()`, which is based on `frappe.session.user`. No frontend-provided IDs, emails, users, members, courses, quizzes, submissions, or filters were introduced.

No cache and no per-row database queries were added.

## Verification result

- Confirmed expected `LMS Quiz Submission` query reduction from 3 to 2 in the instructor metrics course-present path.
- Confirmed Course Performance still has its complete scoped quiz query.
- Confirmed Recent Submissions and Instructor Notifications now reuse the same latest-10 quiz row set.
- Confirmed no frontend files were changed.
- Confirmed no cache was added.
- Python syntax validation could not be run: native `python` and `py` commands are unavailable, and WSL has no installed distributions.
- `migrate` was not run.
