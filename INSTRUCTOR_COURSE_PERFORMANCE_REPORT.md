# Instructor Course Performance Report

## Files Modified

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_COURSE_PERFORMANCE_REPORT.md`

## Response Shape

`lms.lms.api.get_my_instructor_metrics` now includes `course_performance` while preserving the existing fields:

```json
{
  "my_course_count": 0,
  "total_unique_learners": 0,
  "average_course_progress": 0,
  "recent_submissions": [],
  "course_performance": [
    {
      "course_title": "",
      "completion_percentage": 0,
      "average_score": 0,
      "learner_count": 0
    }
  ],
  "courses": []
}
```

## Calculation Rules

- Course scope uses only `_get_current_user_created_courses()`, which reads `Course Instructor` for `frappe.session.user`.
- No instructor email, user ID, member ID, or arbitrary course ID is accepted from the frontend.
- `completion_percentage` is the average `LMS Enrollment.progress` for each owned course.
- `learner_count` is the unique `LMS Enrollment.member` count for each owned course.
- Course rows are sorted by highest `completion_percentage`, then highest `learner_count`.
- Courses with no enrollments return `completion_percentage: 0` and `learner_count: 0`.
- Courses with no valid scored submissions return `average_score: 0`.

## Score Source Used

- `LMS Quiz Submission.percentage` is used for `average_score`.
- `LMS Assignment Submission` was inspected and has status fields but no normalized numeric score or percentage field, so assignment status is not treated as a score.

## Frontend Behavior

- Loading: skeleton course rows.
- Empty: `No course performance data`.
- Error: `Unable to load course performance`.
- Each course row shows course title, `Completion: n%`, progress bar, `Average score: n%`, and `n learners`.
- The card does not display internal course IDs, learner names, learner emails, or submission IDs.

## Verification Result

- The endpoint implementation still uses the existing `get_my_instructor_metrics` API.
- Course scoping remains session-based through the existing created-course helper.
- Runtime endpoint verification for the current instructor could not be completed from this shell because no authenticated instructor session cookie is available.
- A local unauthenticated API probe to `/api/method/lms.lms.api.get_my_instructor_metrics` reached Frappe and returned `403 Forbidden`, so no instructor-scoped response body could be verified.
- A local page probe to `/lms/instructor-dashboard` timed out, so visual verification of the card could not be completed in this shell.
