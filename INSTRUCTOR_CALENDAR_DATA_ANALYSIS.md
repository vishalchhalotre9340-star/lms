# Instructor Calendar Data Analysis

## Exact Files and DocTypes Inspected

- `lms/lms/doctype/lms_assignment/lms_assignment.json` (`LMS Assignment`)
- `lms/lms/doctype/lms_assignment_submission/lms_assignment_submission.json` (`LMS Assignment Submission`)
- `lms/lms/doctype/lms_quiz/lms_quiz.json` (`LMS Quiz`)
- `lms/lms/doctype/lms_quiz_submission/lms_quiz_submission.json` (`LMS Quiz Submission`)
- `lms/lms/doctype/lms_batch/lms_batch.json` (`LMS Batch`)
- `lms/lms/doctype/lms_batch_timetable/lms_batch_timetable.json` (`LMS Batch Timetable`)
- `lms/lms/doctype/lms_certificate_request/lms_certificate_request.json` (`LMS Certificate Request`)
- `lms/lms/doctype/lms_course/lms_course.json` (`LMS Course`)
- `lms/lms/doctype/course_lesson/course_lesson.json` (`Course Lesson`)
- `lms/lms/doctype/course_chapter/course_chapter.json` (`Course Chapter`)
- `lms/lms/doctype/chapter_reference/chapter_reference.json` (`Chapter Reference`)
- `lms/lms/doctype/lesson_reference/lesson_reference.json` (`Lesson Reference`)
- `lms/lms/doctype/lms_assessment/lms_assessment.json` (`LMS Assessment`)
- `lms/lms/doctype/batch_course/batch_course.json` (`Batch Course`)
- `lms/lms/doctype/evaluator_schedule/evaluator_schedule.json` (`Evaluator Schedule`)
- `lms/lms/doctype/scheduled_flow/scheduled_flow.json` (`Scheduled Flow`)
- `lms/lms/api.py`
- `lms/lms/utils.py`

No current `LMS Batch Old` DocType was found in the `lms/lms/doctype` tree.

## Real Date Fields Found

Assignment deadlines:

- No genuine assignment deadline/due date field exists on `LMS Assignment`.
- `LMS Assignment Submission.creation` exists, but it is a submission timestamp, not a deadline.

Quiz deadlines:

- No genuine quiz deadline/due date field exists on `LMS Quiz`.
- `LMS Quiz.duration` exists, but it is a duration in minutes, not a due date.
- `LMS Quiz Submission.creation` exists, but it is a completion/submission timestamp, not a deadline.

Batch start/end dates:

- `LMS Batch.start_date`
- `LMS Batch.end_date`
- `LMS Batch.start_time`
- `LMS Batch.end_time`
- `LMS Batch.timezone`
- `LMS Batch.evaluation_end_date`
- `LMS Batch Timetable.date`
- `LMS Batch Timetable.start_time`
- `LMS Batch Timetable.end_time`
- `LMS Batch Timetable.duration`
- `LMS Batch Timetable.milestone`

Certificate evaluation/request dates:

- `LMS Certificate Request.date`
- `LMS Certificate Request.start_time`
- `LMS Certificate Request.end_time`
- `LMS Certificate Request.status`
- `LMS Certificate Request.timezone`
- `LMS Certificate Request.course`
- `LMS Certificate Request.batch_name`

Course schedule dates:

- `LMS Course.published_on` exists, but this is publication metadata, not a schedule/deadline.
- `LMS Course.upcoming` is a boolean, not a date.
- `Course Lesson` has no schedule/deadline date field.
- `Scheduled Flow.date`, `Scheduled Flow.start_time`, and `Scheduled Flow.end_time` exist, but `Scheduled Flow` is a child table tied to lessons and should only be used if implementation can safely join it back to instructor-owned courses through the lesson/course relationship.

## Safe Session-Scoped Data Sources

Safe with existing session ownership patterns:

- Instructor-owned courses through `_get_current_user_created_courses()` in `lms/lms/api.py`, which scopes via `Course Instructor.instructor == frappe.session.user`.
- Course-linked certificate requests by filtering `LMS Certificate Request.course` to the current instructor's course names.
- Assignment and quiz submissions can be session-scoped by filtering their `course` field to current instructor course names, but they provide activity dates, not future deadlines.

Safe with existing batch ownership pattern, if added deliberately:

- `can_modify_batch(batch)` in `lms/lms/utils.py` checks `Course Instructor` with `parenttype: "LMS Batch"` and `instructor: frappe.session.user`, or allows moderators.
- `get_created_batches()` in `lms/lms/api.py` already uses a `Course Instructor` join against `LMS Batch` and filters future `Batch.start_date`.
- Batch dates/timetable can be session-scoped by collecting batches where `Course Instructor.instructor == frappe.session.user` and `parenttype == "LMS Batch"`, or by using the same join pattern as `get_created_batches()`.

## Unavailable or Missing Deadline Fields

Do not use these as deadlines:

- `LMS Assignment.creation` or `modified`: document metadata, not learner deadline.
- `LMS Assignment Submission.creation`: submission activity timestamp, not deadline.
- `LMS Quiz.creation` or `modified`: document metadata, not deadline.
- `LMS Quiz Submission.creation`: completion activity timestamp, not deadline.
- `LMS Quiz.duration`: time limit, not calendar deadline.
- `LMS Course.published_on`: publication date, not course schedule deadline.
- `LMS Course.upcoming`: boolean flag, not a date.
- `Course Lesson.creation` or `modified`: content metadata, not scheduled lesson date.
- `LMS Enrollment.creation`: enrollment activity timestamp, not deadline.
- `LMS Certificate.issue_date` / `expiry_date`: certificate lifecycle dates, not instructor upcoming work unless the feature is explicitly about certificate issuance/expiry.

## Can an Instructor Calendar Be Built Without New Schema?

Yes, but only for valid existing schedule sources:

- Upcoming batch dates from `LMS Batch.start_date`, `end_date`, `start_time`, `end_time`, and optionally `LMS Batch Timetable`.
- Certificate evaluation/request dates from `LMS Certificate Request.date`, `start_time`, `end_time`, and `status`.
- Scheduled lesson flow dates from `Scheduled Flow` only if joined back to `Course Lesson.course` and then filtered to current instructor-owned courses.

No, for assignment or quiz deadlines:

- Current `LMS Assignment` and `LMS Quiz` DocTypes do not have due date/deadline fields. A true assignment/quiz deadline feature would require schema changes or an existing schedule mapping that was not found here.

## Recommended First Calendar Feature

Recommended first implementation: a combined `Instructor Calendar` using valid sources only:

- Upcoming Batch Dates from `LMS Batch`
- Certificate Evaluations from `LMS Certificate Request`

Reasoning:

- Both have real date/time fields.
- Both already have existing ownership/scoping patterns in the codebase.
- They can be shown without inventing assignment or quiz deadline semantics.

Defer:

- Assignment deadlines and quiz deadlines until real due date fields exist.
- Scheduled lesson flow unless the product wants lesson sessions in the instructor dashboard and the join from `Scheduled Flow.lesson` to `Course Lesson.course` is explicitly implemented.

## Proposed Response JSON

Recommended field to add later to `lms.lms.api.get_my_instructor_metrics`:

```json
{
  "instructor_calendar": [
    {
      "type": "Batch Start",
      "title": "",
      "course_name": "",
      "date": "",
      "start_time": "",
      "end_time": "",
      "status": ""
    },
    {
      "type": "Certificate Evaluation",
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

Suggested privacy-safe behavior:

- Return display titles only.
- Do not return batch IDs, course IDs, request IDs, user IDs, member IDs, learner emails, evaluator emails, or internal document names.
- Sort by upcoming `date`, then `start_time`.
- Limit to a compact count such as 5 or 10.

## Security Considerations

- Do not accept instructor email, user ID, member ID, certificate request ID, batch ID, or arbitrary course IDs from the frontend.
- Scope course-based data through `_get_current_user_created_courses()` and `frappe.session.user`.
- Scope batch-based data using the existing `Course Instructor` relationship for `LMS Batch` or the same join pattern used by `get_created_batches()`.
- Moderators may be allowed according to existing dashboard access, but course/batch selection must still be backend-derived.
- Do not expose internal document names or private learner/evaluator identifiers in calendar items.
- Certificate request rows include `member` and `evaluator`; those should not be returned for a compact instructor dashboard calendar.

## Exact Files Needed in Next Implementation Chunk

Likely implementation files:

- `lms/lms/api.py`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- A new implementation report, for example `INSTRUCTOR_CALENDAR_IMPLEMENTATION_REPORT.md`

No routing, sidebar, authentication, database schema, or package dependency changes are needed for the recommended first implementation.
