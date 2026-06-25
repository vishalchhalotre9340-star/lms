# Instructor Basic Metrics Implementation Report

## Files Changed

- `lms/lms/api.py`

No frontend files were changed.

No schema changes were made.

## Endpoint Path

```text
lms.lms.api.get_my_instructor_metrics
```

HTTP path:

```text
/api/method/lms.lms.api.get_my_instructor_metrics
```

## Access Rules

- Guest users are rejected.
- Access is limited to users who already qualify through existing instructor/moderator behavior.
- The endpoint uses only `frappe.session.user`.
- No frontend-supplied `user`, `instructor`, `member`, `course`, or `role` arguments are accepted.
- Pure students are rejected.
- Evaluator-only users are rejected.
- Unauthorized users are rejected.
- Moderators without a matching created-course set still receive only their own created-course data, not global data.

## Created-Course Scoping Rule

The endpoint mirrors the existing session-scoped created-course behavior by resolving courses from:

```python
frappe.get_all("Course Instructor", {"instructor": frappe.session.user}, pluck="parent")
```

That keeps the scope on the current session user only and does not use any frontend identity input.

## Unique Learner Calculation Rule

The endpoint counts learners by scanning only `LMS Enrollment` rows for the current user’s created courses.

Rules implemented:

- each course gets its own unique `learner_count`
- `total_unique_learners` is the unique count of `LMS Enrollment.member` across all of those created courses
- a learner enrolled in multiple created courses is counted once in `total_unique_learners`

## Response Shape

```json
{
  "my_course_count": 0,
  "total_unique_learners": 0,
  "courses": [
    {
      "name": "",
      "title": "",
      "learner_count": 0
    }
  ]
}
```

## Test Commands And Results

### Guest rejection

Command:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8080/api/method/lms.lms.api.get_my_instructor_metrics' -UseBasicParsing -TimeoutSec 15
```

Result:

```text
STATUS=417
ERROR=The remote server returned an error: (417) EXPECTATION FAILED.
```

Interpretation:

- Guest access is rejected as expected.

### Source verification

Command:

```powershell
Select-String -Path lms/lms/api.py -Pattern "get_my_instructor_metrics|_get_current_user_created_courses" -Context 0,4
```

Result:

- The new endpoint and helper are present in `lms/lms/api.py`.

## Limitations

- Authenticated instructor, moderator, and pure-student runtime tests could not be completed from this shell because no bench console / authenticated session was available.
- `bench migrate` was not run because no schema changes were made.

