# Pending Work API Analysis

## Scope

This report analyzes the existing LMS quiz and assignment data flow for a student-facing pending work count. No application code was changed.

The requested dashboard values are:

- `pending_quiz_count`
- `pending_assignment_count`

The safe scope is the currently logged-in user only: `frappe.session.user`.

## Quiz Data Flow

### DocTypes

#### `LMS Quiz`

File: `lms/lms/doctype/lms_quiz/lms_quiz.json`

Relevant fields:

- `title`
- `questions`
- `lesson`
- `course`
- `max_attempts`
- `show_answers`
- `show_submission_history`
- `passing_percentage`
- `total_marks`
- `shuffle_questions`
- `limit_questions_to`
- `duration`
- `enable_negative_marking`
- `marks_to_cut`

There is no quiz due date or deadline field in this DocType.

Permissions:

- `System Manager`, `Moderator`, `Course Creator`, and `Batch Evaluator` have management access.
- `LMS Student` has read/report/export/print/email/share access.
- Students do not create quiz documents.

#### `LMS Quiz Submission`

File: `lms/lms/doctype/lms_quiz_submission/lms_quiz_submission.json`

Relevant fields:

- `quiz`
- `quiz_title`
- `course`
- `member`
- `member_name`
- `score`
- `score_out_of`
- `percentage`
- `passing_percentage`
- `result`

There is no quiz submission due date field.

Permissions:

- `System Manager` has full access.
- `LMS Student` has read/report/export/print/email/share with `if_owner`.
- Students do not create submissions through DocType permissions. Quiz submissions are created by the server API.

### Python APIs And Functions

#### Quiz controller

File: `lms/lms/doctype/lms_quiz/lms_quiz.py`

Functions found:

- `LMSQuiz.get_last_submission_details()`
  - Reads the latest `LMS Quiz Submission` where:
    - `quiz == self.name`
    - `owner == frappe.session.user`
  - This is scoped to the current session user.

- `submit_quiz(quiz, results=None)`
  - Whitelisted.
  - Submits a quiz and calls `create_submission`.

- `create_submission(quiz, results, score, score_out_of, percentage, result)`
  - Creates `LMS Quiz Submission`.
  - Sets:
    - `member = frappe.session.user`
  - Saves with `ignore_permissions=True`.
  - This is safe for submission creation because the member is server-scoped.

- `save_progress_after_quiz(submission, quiz, percentage)`
  - Marks lesson progress only if the quiz result satisfies the quiz passing percentage.

- `check_answer(...)`
  - Whitelisted.
  - Restricts answer checking unless the user has elevated roles or the quiz allows answer display.

#### Quiz submission controller

File: `lms/lms/doctype/lms_quiz_submission/lms_quiz_submission.py`

Functions found:

- `validate()`
- `validate_quiz_attempts()`
- `set_score()`
- `notify_member()`

The controller validates attempt limits and scoring. It does not expose a student pending-work API.

#### Course lesson completion logic

File: `lms/lms/doctype/course_lesson/course_lesson.py`

Functions found:

- `save_progress(lesson, course, scorm_details=None)`
  - Checks that the current session user is enrolled in the course before saving progress.
  - Enforces quiz and assignment completion when LMS settings require it.

- `get_quiz_progress(lesson)`
  - Parses quiz references from lesson content.
  - Checks `LMS Quiz Submission` for:
    - `quiz`
    - `member = frappe.session.user`
    - `percentage >= passing_percentage`
  - Returns incomplete when no passing submission exists.

This is the closest existing server-side definition of quiz completion for a logged-in student, but it is lesson-scoped and not a dashboard API.

#### Assessment progress API

File: `lms/lms/api.py`

Functions found:

- `get_course_assessment_progress(course, member)`
  - Whitelisted.
  - Calls `can_modify_course(course)`.
  - Intended for instructors/admin-style users.
  - Accepts a frontend-provided `member`.

- `get_course_quiz_progress(course, member)`
  - Gets course lesson quiz references.
  - Reads latest quiz submission for the supplied member.

- `get_assessment_from_lesson(course, assessment_type)`
  - Extracts quiz or assignment references from course lesson content blocks.

This API should not be used for the student dashboard because it accepts a member value and is gated for course modifiers, not student self-service.

### Vue Pages And Components

Files found:

- `frontend/src/components/Quiz.vue`
  - Loads quiz data through `lms.lms.utils.get_quiz_with_questions`.
  - Submits through `lms.lms.doctype.lms_quiz.lms_quiz.submit_quiz`.
  - Reads attempts using `frappe.client.get_list` on `LMS Quiz Submission` with `member` from the current user store.

- `frontend/src/pages/QuizPage.vue`
  - Hosts the quiz page.

- `frontend/src/pages/QuizSubmission.vue`
  - Submission detail page.
  - Frontend-restricted to instructor/moderator-style users.

- `frontend/src/pages/QuizSubmissionList.vue`
  - Submission list page.
  - Frontend-restricted to instructor/moderator-style users.

- `frontend/src/pages/Quizzes.vue`
  - Quiz management page.

- `frontend/src/utils/quiz.js`
  - Embeds quizzes in lesson content.

## Assignment Data Flow

### DocTypes

#### `LMS Assignment`

File: `lms/lms/doctype/lms_assignment/lms_assignment.json`

Relevant fields:

- `title`
- `type`
- `grade_assignment`
- `course`
- `question`
- `show_answer`
- `answer`

There is no assignment due date or deadline field.

Permissions:

- `System Manager`, `Moderator`, `Course Creator`, and `Batch Evaluator` have management access.
- `LMS Student` has read/report/export/print/email/share access.

#### `LMS Assignment Submission`

File: `lms/lms/doctype/lms_assignment_submission/lms_assignment_submission.json`

Relevant fields:

- `assignment`
- `assignment_title`
- `type`
- `member`
- `member_name`
- `evaluator`
- `assignment_attachment`
- `answer`
- `status`
- `question`
- `comments`
- `course`
- `lesson`

`status` values:

- `Pass`
- `Fail`
- `Not Graded`
- `Not Applicable`

There is no assignment submission due date field.

Permissions:

- `System Manager` has full access.
- `LMS Student` has create/read/write/report/export/print/email/share with `if_owner`.
- `Moderator`, `Batch Evaluator`, and `Course Creator` have broader submission access.

### Python APIs And Functions

#### Assignment controller

File: `lms/lms/doctype/lms_assignment/lms_assignment.py`

The controller currently has no custom assignment logic.

#### Assignment submission controller

File: `lms/lms/doctype/lms_assignment_submission/lms_assignment_submission.py`

Functions found:

- `validate()`
- `enforce_member_ownership()`
- `validate_duplicates()`
- `validate_url()`
- `validate_status()`

Security-relevant behavior:

- `enforce_member_ownership()` prevents non-privileged users from creating or editing a submission for another member.
- For non-privileged users, the controller sets:
  - `member = frappe.session.user`
- Privileged roles are:
  - `Moderator`
  - `Course Creator`
  - `Batch Evaluator`
  - `System Manager`

This is safe for student assignment submission creation, but it is not a pending-work API.

#### Course lesson completion logic

File: `lms/lms/doctype/course_lesson/course_lesson.py`

Functions found:

- `get_assignment_progress(lesson)`
  - Parses assignment references from lesson content.
  - Checks whether an `LMS Assignment Submission` exists for:
    - `assignment`
    - `member = frappe.session.user`
  - Current lesson completion treats any submission as complete, regardless of `Pass`, `Fail`, or `Not Graded`.

This is the closest existing server-side definition of assignment completion for a logged-in student, but it is lesson-scoped and not a dashboard API.

#### Batch assessment helper

File: `lms/lms/utils.py`

Functions found:

- `get_assessments(batch)`
  - Whitelisted.
  - Uses `member = frappe.session.user`.
  - Checks whether the user is enrolled in the batch or can modify the batch.
  - Returns assessment completion details for that batch.

- `get_assignment_details(assessment, member)`
  - Reads `LMS Assignment Submission` for the supplied member.

- `get_quiz_details(assessment, member)`
  - Reads `LMS Quiz Submission` for the supplied member.

- `has_submitted_assessment(assessment, assessment_type, member=None)`
  - Defaults to `frappe.session.user` when `member` is omitted.

`get_assessments(batch)` is safe for a single enrolled batch because it scopes the user server-side. It does not provide dashboard-wide pending counts for all enrolled courses.

### Vue Pages And Components

Files found:

- `frontend/src/components/Assignment.vue`
  - Loads assignment data with `frappe.client.get`.
  - Creates assignment submissions with `frappe.client.insert`.
  - The client sends the current user's member value, but the backend submission controller enforces `frappe.session.user` for non-privileged users.

- `frontend/src/pages/AssignmentSubmission.vue`
  - Hosts assignment submission UI.

- `frontend/src/pages/AssignmentSubmissionList.vue`
  - Submission list page.
  - Frontend-restricted to instructor/moderator-style users.

- `frontend/src/pages/Assignments.vue`
  - Assignment management page.

- `frontend/src/utils/assignment.js`
  - Embeds assignments in lesson content.
  - Looks up the current user's assignment submission before opening the assignment frame.

## Current Logged-In Student Data Sources

### Enrolled Courses

File: `lms/lms/utils.py`

Functions:

- `get_courses(filters=None, start=0)`
- `update_course_filters(filters)`
- `get_enrollment_details(courses)`

When called with:

```json
{ "enrolled": 1 }
```

`update_course_filters()` reads `LMS Enrollment` using:

```python
{"member": frappe.session.user}
```

This is safe and server-scoped.

`get_enrollment_details()` also uses `frappe.session.user` to attach membership/progress data.

### Incomplete Quizzes

There is no existing dashboard-wide student API for incomplete quizzes.

The current lesson-completion definition is in:

File: `lms/lms/doctype/course_lesson/course_lesson.py`

Function:

- `get_quiz_progress(lesson)`

A quiz is incomplete for lesson progress when the logged-in user has no passing quiz submission:

```python
member = frappe.session.user
percentage >= passing_percentage
```

The instructor/admin course assessment API can calculate quiz progress for a supplied member, but it should not be reused for the student dashboard because it accepts a frontend-provided member and is protected by `can_modify_course(course)`.

### Incomplete Assignments

There is no existing dashboard-wide student API for incomplete assignments.

The current lesson-completion definition is in:

File: `lms/lms/doctype/course_lesson/course_lesson.py`

Function:

- `get_assignment_progress(lesson)`

An assignment is incomplete for lesson progress when the logged-in user has no `LMS Assignment Submission` for that assignment.

Existing lesson completion does not require the assignment to be graded or passed.

### Due Dates

No due date or deadline fields were found in the quiz, assignment, submission, or batch assessment DocTypes used by this flow:

- `LMS Quiz`
- `LMS Quiz Submission`
- `LMS Assignment`
- `LMS Assignment Submission`
- `LMS Assessment`
- `Course Lesson`

Pending work APIs should return `due_date: null` unless a future schema adds assessment due dates.

### Submission Status

Quiz submission status comes from:

File: `lms/lms/doctype/lms_quiz_submission/lms_quiz_submission.json`

Relevant fields:

- `percentage`
- `passing_percentage`
- `result`

Assignment submission status comes from:

File: `lms/lms/doctype/lms_assignment_submission/lms_assignment_submission.json`

Relevant field:

- `status`

Values:

- `Pass`
- `Fail`
- `Not Graded`
- `Not Applicable`

## Safe Existing APIs

### Safe for enrolled course data

API:

- `lms.lms.utils.get_courses`

Safe usage:

```json
{
  "filters": {
    "enrolled": 1
  }
}
```

Reason:

- Enrollment is resolved server-side using `frappe.session.user`.

### Safe for one enrolled batch's assessment status

API:

- `lms.lms.utils.get_assessments(batch)`

Reason:

- Uses `frappe.session.user`.
- Checks batch enrollment or batch modification permission.

Limitation:

- Requires a batch argument.
- Only covers batch assessments.
- Does not provide dashboard-wide pending quiz or assignment counts across enrolled courses.

### Not safe or not appropriate for student dashboard counts

API:

- `lms.lms.api.get_course_assessment_progress(course, member)`

Reason:

- Accepts frontend-provided `member`.
- Requires `can_modify_course(course)`.
- Intended for instructor/admin assessment views, not student self-service.

Client-side list queries should also be avoided for dashboard pending counts:

- `frappe.client.get_list` on `LMS Quiz Submission`
- `frappe.client.get_list` on `LMS Assignment Submission`

Reason:

- They would require frontend-provided user/member filters.
- They scatter security-sensitive counting logic into the frontend.
- They do not provide a single server-scoped definition of pending work.

## Conclusion

No existing API safely provides both:

- `pending_quiz_count`
- `pending_assignment_count`

for only `frappe.session.user` across the logged-in student's enrolled courses.

The current safe pieces are:

- enrolled courses from `lms.lms.utils.get_courses`
- lesson-level completion logic from `course_lesson.py`
- batch-level assessment status from `lms.lms.utils.get_assessments(batch)`

These are not enough for a dashboard-level pending work count without adding a new server-scoped endpoint.

## Recommended Secure Backend Endpoint

Add one student-scoped endpoint.

Suggested location:

- `lms/lms/api.py`

Suggested function name:

- `get_my_pending_work`

Security requirements:

- Accept no `member` or `student` argument.
- Use `member = frappe.session.user` internally.
- Reject Guest users.
- Derive enrolled courses from `LMS Enrollment` where `member = frappe.session.user`.
- Do not call instructor/admin assessment APIs.
- Do not weaken DocType permissions.
- Do not expose unrestricted list queries.

Suggested response structure:

```json
{
  "pending_quiz_count": 2,
  "pending_assignment_count": 1,
  "quizzes": [
    {
      "quiz": "quiz-name",
      "title": "Quiz title",
      "course": "course-name",
      "course_title": "Course title",
      "lesson": "lesson-name",
      "lesson_title": "Lesson title",
      "status": "Not Attempted",
      "best_percentage": 0,
      "passing_percentage": 80,
      "due_date": null,
      "route": "/lms/quiz/quiz-name"
    }
  ],
  "assignments": [
    {
      "assignment": "assignment-name",
      "title": "Assignment title",
      "course": "course-name",
      "course_title": "Course title",
      "lesson": "lesson-name",
      "lesson_title": "Lesson title",
      "status": "Not Submitted",
      "submission": null,
      "due_date": null,
      "route": "/lms/assignment-submission/assignment-name/new"
    }
  ]
}
```

Recommended counting rules for initial implementation:

- Pending quiz:
  - Quiz appears in an enrolled course lesson.
  - Current user has no passing `LMS Quiz Submission` for that quiz.
  - Passing should follow existing lesson progress behavior: `percentage >= passing_percentage`.

- Pending assignment:
  - Assignment appears in an enrolled course lesson.
  - Current user has no `LMS Assignment Submission` for that assignment.
  - This matches existing lesson progress behavior.

If the product wants assignments with `Fail` or `Not Graded` to count as pending, that is a separate product decision because current lesson progress treats any submission as complete.

## Permission And Security Risks

- Do not expose an endpoint that accepts arbitrary `member`, `student`, or `user` from the frontend.
- Do not reuse `get_course_assessment_progress(course, member)` for students.
- Do not rely on frontend user store values for permission-sensitive counting.
- Do not add broad `frappe.client.get_list` calls from the dashboard for submissions.
- Do not return another student's submissions, progress, or pending work.
- Be careful with batch assessments because `get_assessments(batch)` is batch-scoped, while the dashboard needs user-wide counts.

## Files Needed For Next Implementation Step

Backend:

- `lms/lms/api.py`
  - Add `get_my_pending_work`.

- `lms/lms/doctype/course_lesson/course_lesson.py`
  - Reuse or mirror assessment extraction and completion logic.

- `lms/lms/utils.py`
  - Reuse enrolled course behavior where practical.

Frontend:

- `frontend/src/pages/Home/StudentDashboard.vue`
  - Replace static pending quiz and pending assignment placeholders with the new endpoint values only after the endpoint exists.

Testing/reporting:

- Add or update a student dashboard data report after implementation.
- Test as:
  - pure student with no enrolled courses
  - pure student with enrolled courses and no submissions
  - pure student with passed quiz submission
  - pure student with assignment submission
  - instructor/admin who also has `LMS Student`

