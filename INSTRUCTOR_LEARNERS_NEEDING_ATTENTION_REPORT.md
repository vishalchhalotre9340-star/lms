# Instructor Learners Needing Attention Report

## Files modified

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_LEARNERS_NEEDING_ATTENTION_REPORT.md`

## Exact progress threshold rule

Learners are included only when their `LMS Enrollment.progress` value is a real enrollment progress value below `50`. Activity dates, assignment status, quiz status, and other substitute signals are not used.

## Response shape

The existing `lms.lms.api.get_my_instructor_metrics` response now includes:

```json
{
  "learners_needing_attention": [
    {
      "learner_name": "",
      "course_name": "",
      "progress": 0,
      "enrolled_at": ""
    }
  ]
}
```

## Sorting and limit rule

Rows are sorted by lowest `progress` first, then newest enrollment `creation` timestamp first. The backend returns at most 5 learners.

## Privacy and scoping rule

The backend uses the existing session-scoped created-course list from `_get_current_user_created_courses()`. It only queries `LMS Enrollment` rows for those courses. The response uses `member_name` as the safe learner display name and does not return learner email, member ID, enrollment ID, course ID, or internal document names.

## Loading, empty, and error behavior

The Instructor Dashboard adds a compact section below Upcoming Schedule.

- Loading: skeleton learner rows.
- Empty: `No learners need attention right now`.
- Error: `Unable to load learners needing attention`.

## Verification result

- Confirmed the source field is `LMS Enrollment.progress`, a Float enrollment field used by existing course progress behavior.
- Confirmed the query is scoped to current instructor-created courses only.
- Confirmed only progress values below 50 are returned.
- Confirmed the backend limit is 5.
- Confirmed the frontend sends no new API parameters.
- Confirmed no private IDs or emails are returned or displayed.
