# Instructor Recent Learners Report

## Files Modified

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_RECENT_LEARNERS_REPORT.md`

## LMS Enrollment Fields Used

- `member_name`
- `course`
- `creation`
- `progress`

`member_name` is an existing safe display-name field fetched from `member.full_name`. The response does not include `member`, `member_username`, learner email, enrollment document name, or any internal learner identifier.

## Response Shape

`lms.lms.api.get_my_instructor_metrics` now includes:

```json
{
  "recent_learners": [
    {
      "learner_name": "",
      "course_name": "",
      "enrolled_at": "",
      "progress": 0
    }
  ]
}
```

Existing endpoint fields remain unchanged:

- `my_course_count`
- `total_unique_learners`
- `average_course_progress`
- `pending_evaluations_count`
- `pending_evaluations`
- `recent_submissions`
- `course_performance`
- `learner_growth`
- `instructor_notifications`
- `courses`

## Privacy Rule

- Backend scoping reuses `_get_current_user_created_courses()`, which uses `frappe.session.user`.
- No instructor email, user ID, member ID, or arbitrary course ID is accepted from the frontend.
- Learner display uses `LMS Enrollment.member_name`; if missing, the backend returns `Learner`.
- Course display uses the current instructor course title map; if missing, the backend returns `Course`.
- No private IDs, internal document names, learner emails, or member IDs are returned.

## Sort and Limit Rule

- Recent learners are read from `LMS Enrollment` only where `course` is in the current logged-in instructor or moderator's created-course list.
- Rows are sorted by `creation desc`.
- The response returns a maximum of 5 enrollment rows.

## Loading, Empty, and Error Behavior

- Loading: three skeleton learner rows.
- Empty: `No recent learners`.
- Error: `Unable to load recent learners`.
- Populated rows show learner name, course name, enrollment time, and `Progress: n%` with a compact progress bar.

## Verification Result

- Confirmed recent learners are filtered only by current session user-created courses.
- Confirmed the backend query uses `limit=5`.
- Confirmed the frontend uses the existing `lms.lms.api.get_my_instructor_metrics` resource and sends no API parameters.
- Confirmed response/UI fields exclude learner emails, member IDs, enrollment IDs, and internal document names.
- Confirmed no dependencies or packages were added.
- Confirmed only these files were changed for this task:
  - `lms/lms/api.py`
  - `frontend/src/pages/Home/InstructorDashboard.vue`
  - `INSTRUCTOR_RECENT_LEARNERS_REPORT.md`
