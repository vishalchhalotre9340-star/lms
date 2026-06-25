# Instructor Calendar Implementation Report

## Files Modified

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_CALENDAR_IMPLEMENTATION_REPORT.md`

## Exact DocTypes and Date Fields Used

`LMS Batch`

- `title`
- `start_date`
- `end_date`
- `start_time`
- `end_time`
- `timezone`

`LMS Certificate Request`

- `course`
- `course_title`
- `date`
- `start_time`
- `end_time`
- `status`

Assignment, quiz, submission, course publish, and quiz duration fields are not used for calendar events.

## Event and Status Rules

Supported event types:

- `Batch Start`: created from `LMS Batch.start_date`.
- `Batch End`: created from `LMS Batch.end_date`.
- `Certificate Evaluation`: created from `LMS Certificate Request.date`.

Date rules:

- Only events whose real event date is today or later are returned.
- Batch start/end events use batch `start_date` / `end_date`; they do not use creation or modified timestamps.
- Certificate evaluations use request `date`; they do not use request creation time.

Status rules:

- `LMS Certificate Request.status` actual values inspected: `Upcoming`, `Completed`, `Cancelled`.
- Certificate evaluation calendar items include only `status == "Upcoming"`.
- `Cancelled` and `Completed` requests are excluded from upcoming schedule results.
- Batches do not have a genuine schedule status field, so batch calendar rows return an empty `status`.

## Response Shape

`lms.lms.api.get_my_instructor_metrics` now includes:

```json
{
  "instructor_calendar": [
    {
      "type": "",
      "title": "",
      "course_name": "",
      "date": "",
      "start_time": "",
      "end_time": "",
      "status": ""
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
- `recent_learners`
- `courses`

## Sorting and Limit Rule

- Combined schedule rows are sorted by nearest `date` first, then earliest `start_time`.
- The final response returns at most 10 items.

## Privacy and Scoping Rule

- No frontend-provided instructor email, user ID, batch ID, course ID, certificate request ID, member ID, or arbitrary ID is accepted.
- Batch events are scoped through `Course Instructor` with:
  - `instructor == frappe.session.user`
  - `parenttype == "LMS Batch"`
- Certificate evaluations are scoped to course names returned by `_get_current_user_created_courses()`, which uses `frappe.session.user`.
- Moderator access does not expose every batch; batch rows still require a current-session `Course Instructor` ownership row.
- Returned fields exclude batch IDs, course IDs, request IDs, member IDs, learner emails, evaluator emails, and internal document names.

## Loading, Empty, and Error Behavior

- Loading: three skeleton schedule rows.
- Empty: `No upcoming schedule items`.
- Error: `Unable to load upcoming schedule`.
- Populated rows show event type badge, title, optional course name, date, optional time range, and a status badge only when a genuine status exists.

## Verification Result

- Confirmed only real `LMS Batch` and `LMS Certificate Request` schedule fields are used.
- Confirmed assignment dates, quiz dates, submission dates, course published dates, and quiz duration are not used as deadlines.
- Confirmed batch schedule rows are scoped by current session user batch ownership through `Course Instructor`.
- Confirmed certificate evaluation rows are scoped by current session user-created courses.
- Confirmed the response returns at most 10 items.
- Confirmed no private IDs or emails are returned in calendar items.
- Confirmed no frontend controls or API parameters were added.
- Confirmed only these files were changed:
  - `lms/lms/api.py`
  - `frontend/src/pages/Home/InstructorDashboard.vue`
  - `INSTRUCTOR_CALENDAR_IMPLEMENTATION_REPORT.md`
