# Instructor Dashboard Shell Report

## Files Changed

- `frontend/src/router.js`
- `frontend/src/pages/Home/InstructorDashboard.vue`
- `INSTRUCTOR_DASHBOARD_SHELL_REPORT.md`

No backend Python files were changed.

The following files were not changed for this task:

- `frontend/src/pages/Home/StudentDashboard.vue`
- sidebar logic
- `frontend/vite.config.js`

## Route URL

```text
http://127.0.0.1:8080/lms/instructor-dashboard
```

Vue route:

```text
/instructor-dashboard
```

Route name:

```text
InstructorDashboard
```

## Allowed Roles

The dashboard shell allows users whose existing user-store flags qualify them as:

- Instructor: `userResource.data.is_instructor`
- Moderator: `userResource.data.is_moderator`

No new permissions or backend checks were added.

## Blocked Roles

Users without instructor or moderator flags are redirected to `Home`.

This blocks:

- pure students
- guests
- evaluator-only users
- system-manager-only users unless they also have the existing instructor or moderator flag

## UI Shell

The page includes static placeholder cards only:

- My Courses
- Total Learners
- Pending Evaluations
- Average Course Progress
- Recent Submissions
- Course Performance

Each card displays:

```text
Data will load in next phase
```

A loading skeleton is shown while role data is loading.

## Test Result

### Route HTTP check

Command:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8080/lms/instructor-dashboard' -UseBasicParsing -TimeoutSec 15
```

Result:

```text
STATUS=200
```

The route returned the Vite app HTML shell.

### Vue SFC parse/template check

Command:

```powershell
node -e "const fs=require('fs'); const {parse,compileTemplate}=require('./frontend/node_modules/@vue/compiler-sfc'); const file='frontend/src/pages/Home/InstructorDashboard.vue'; const source=fs.readFileSync(file,'utf8'); const parsed=parse(source,{filename:file}); if(parsed.errors.length){ console.error(parsed.errors); process.exit(1); } const result=compileTemplate({source:parsed.descriptor.template.content, filename:file, id:'instructor-dashboard'}); if(result.errors.length){ console.error(result.errors); process.exit(1); } console.log('SFC_PARSE_OK');"
```

Result:

```text
SFC_PARSE_OK
```

Full production build was not run because the local project build script depends on `yarn`, which is not available in this shell.

