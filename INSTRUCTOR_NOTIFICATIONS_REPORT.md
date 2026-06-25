# Instructor Notifications Report

## Files Modified

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_NOTIFICATIONS_REPORT.md`

## Real Source DocTypes Used

- `LMS Enrollment`
- `LMS Assignment Submission`
- `LMS Quiz Submission`
- `LMS Certificate Request`

`LMS Certificate Request` exists in the project and includes real request workflow fields including `course`, `member`, `evaluator`, `date`, `start_time`, `end_time`, and `status`, so certificate-request notifications are included. `LMS Certificate` was inspected and is treated as an issued certificate record, not a request event source.

## Event Rules Used

- `New Enrollment`: each `LMS Enrollment` row created for a current instructor-created course.
- `Assignment Submitted`: each `LMS Assignment Submission` row created for a current instructor-created course.
- `Quiz Completed`: each `LMS Quiz Submission` row created for a current instructor-created course.
- `Certificate Requested`: each `LMS Certificate Request` row created for a current instructor-created course.

Course scope reuses `_get_current_user_created_courses()`, which uses `frappe.session.user` through the `Course Instructor` child table. No frontend-provided instructor, user, member, submission, or course identifier is accepted.

## Response Shape

`lms.lms.api.get_my_instructor_metrics` now includes:

```json
{
  "instructor_notifications": [
    {
      "type": "",
      "message": "",
      "course_name": "",
      "created_at": ""
    }
  ]
}
```

Notification items do not return learner emails, user IDs, enrollment IDs, submission IDs, certificate IDs, or internal document names.

Existing response fields remain unchanged:

- `my_course_count`
- `total_unique_learners`
- `average_course_progress`
- `pending_evaluations_count`
- `pending_evaluations`
- `recent_submissions`
- `course_performance`
- `learner_growth`
- `courses`

## Sort and Limit Rule

- Up to 10 recent rows are read from each supported source DocType within the current instructor's course scope.
- Combined notifications are sorted by `created_at` newest first.
- The final response returns at most 10 notification items.

## Loading, Empty, and Error Behavior

- Loading: three skeleton notification rows.
- Empty: `No recent instructor activity`.
- Error: `Unable to load instructor notifications`.
- Each populated row shows a notification type badge, message, course name, and formatted created time.

## Verification Result

- Confirmed notifications are built only from rows whose `course` is in the current session user's created-course list.
- Confirmed the endpoint returns at most 10 combined notifications.
- Confirmed the frontend uses the existing `lms.lms.api.get_my_instructor_metrics` resource and adds no API parameters.
- Confirmed notification response/UI fields exclude private IDs and emails.
- Confirmed no packages or dependencies were added.
- Confirmed only these files were changed for this task:
  - `lms/lms/api.py`
  - `frontend/src/pages/Home/InstructorDashboard.vue`
  - `INSTRUCTOR_NOTIFICATIONS_REPORT.md`
