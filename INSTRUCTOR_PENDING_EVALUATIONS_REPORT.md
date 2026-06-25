# Instructor Pending Evaluations Report

## Files Modified

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_PENDING_EVALUATIONS_REPORT.md`

## Status/Workflow Rule Used

- `LMS Assignment Submission` has a real `status` select field with values `Pass`, `Fail`, `Not Graded`, and `Not Applicable`.
- Pending evaluations are counted only when `LMS Assignment Submission.status == "Not Graded"`.
- `LMS Quiz Submission` has no status or pending review field in its DocType. Existing quiz submissions are scored with `score`, `percentage`, and `passing_percentage`, so quiz submissions are not counted as pending instructor evaluations.
- Course scope is derived only from `_get_current_user_created_courses()`, which uses `frappe.session.user` through the `Course Instructor` child table. No frontend-provided instructor, member, submission, or course identifier is accepted.

## Response Shape

The existing `lms.lms.api.get_my_instructor_metrics` response now includes:

```json
{
  "pending_evaluations_count": 0,
  "pending_evaluations": []
}
```

Each pending item contains only:

```json
{
  "student_name": "",
  "course_name": "",
  "submission_title": "",
  "submission_type": "",
  "submitted_at": "",
  "status": ""
}
```

Existing response fields remain in place:

- `my_course_count`
- `total_unique_learners`
- `average_course_progress`
- `recent_submissions`
- `course_performance`
- `courses`

## Frontend Behavior

- Loading: the Pending Evaluations card shows `...`.
- Empty: the card shows `No pending evaluations`.
- Error: the card shows `Unable to load pending evaluations`.
- With pending items: the card shows the count, label `Items waiting for review`, and a compact list with student name, course name, submission title, submission type, submitted time, and status badge.

## Verification Result

- Confirmed current instructor scope: pending evaluations are filtered by course names returned from `_get_current_user_created_courses()`, which is scoped to `frappe.session.user`.
- Confirmed no-pending/no-course response includes:

```json
{
  "pending_evaluations_count": 0,
  "pending_evaluations": []
}
```

- Confirmed no internal IDs, learner emails, or user IDs are returned in pending evaluation items.
- Confirmed only these files were changed for this task:
  - `lms/lms/api.py`
  - `frontend/src/pages/Home/InstructorDashboard.vue`
  - `INSTRUCTOR_PENDING_EVALUATIONS_REPORT.md`
