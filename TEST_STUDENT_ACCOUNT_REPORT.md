# Test Student Account Report

## Bench Path

Not available from this environment.

Checks performed:

```powershell
wsl.exe -l -v
```

Result:

```text
Windows Subsystem for Linux has no installed distributions.
```

```powershell
Get-Command bench -ErrorAction SilentlyContinue
```

Result:

```text
No bench command found on PATH.
```

Because WSL has no installed distributions and Bench is not available on the Windows PATH, the requested Bench console workflow could not be opened.

## Site Name

Not found.

The active Frappe site name could not be discovered because WSL/Bench is unavailable in this shell.

## Test Student Email

```text
student.test@example.com
```

## Enabled Status

Not changed.

The user account was not created or reset because the requested Bench console environment is unavailable.

## Final Roles

Not changed.

The role reset could not be performed because the requested Bench console environment is unavailable.

Required target role state remains:

```text
LMS Student
```

Roles that still need to be removed if present:

```text
Instructor
Moderator
Evaluator
System Manager
Course Creator
```

## Guest Endpoint Test Result

Command:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8080/api/method/lms.lms.api.get_my_pending_work' -UseBasicParsing -TimeoutSec 15
```

Result:

```text
STATUS=417
ERROR=The remote server returned an error: (417) EXPECTATION FAILED.
```

Interpretation:

Guest access to `lms.lms.api.get_my_pending_work` is rejected.

## Manual Login URLs

```text
http://127.0.0.1:8080/lms
http://127.0.0.1:8080/api/method/lms.lms.api.get_my_pending_work
http://127.0.0.1:8080/lms/student-dashboard
```

## Status

Blocked before database mutation.

No frontend files, backend API files, router files, sidebar files, Vite config files, database schema, courses, enrollments, quizzes, or assignments were changed for this request.

