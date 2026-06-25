# Product Roadmap

Scope: prioritized roadmap for the current Frappe LMS based on:

- `LMS_FEATURE_GAP_ANALYSIS.md`
- `STUDENT_DASHBOARD_PLAN.md`
- `INSTRUCTOR_DASHBOARD_PLAN.md`

No code changes were made.

Team assumption:

- 1 Frontend Developer
- 1 Backend Developer
- 1 Product Designer

Priority definitions:

- `P0`: Must Have. Needed to make the LMS competitive and operationally clear.
- `P1`: Important. Strong product value after P0 foundations are stable.
- `P2`: Nice to Have. Useful for maturity, differentiation, or specific segments.

Complexity definitions:

- `Low`: Mostly frontend composition or small backend query changes.
- `Medium`: New route/API/model changes with manageable scope.
- `High`: New product subsystem, significant permissions, analytics, AI, or cross-cutting architecture.

## Roadmap Summary

| Timeline | Main Outcome | Product Focus |
| --- | --- | --- |
| 1 Month | Role dashboards and next-action clarity | Student dashboard, instructor dashboard, dashboard APIs, basic admin separation |
| 3 Months | Engagement and analytics foundation | Moderator dashboard, pending work, live/doubt workflows, improved certificates, recommendation basics |
| 6 Months | Competitive differentiation | Skill paths, test series, AI assistant, advanced analytics, marketplace/mobile maturity |

## P0 Must Have

### Student Dashboard

Business Value:

- Improves learner retention and course completion.
- Makes the product feel complete for paid and self-paced learning.
- Creates a foundation for later recommendations, reminders, and AI support.

User Impact:

- Students see enrolled courses, continue learning, progress, pending quizzes, pending assignments, and certificates in one place.
- Reduces confusion after login.

Existing Files To Reuse:

- `frontend/src/pages/Home/Home.vue`
- `frontend/src/pages/Home/StudentHome.vue`
- `frontend/src/components/CourseCard.vue`
- `frontend/src/components/ProgressBar.vue`
- `frontend/src/pages/ProfileCertificates.vue`
- `frontend/src/pages/Courses/CourseCertification.vue`
- `frontend/src/stores/user.js`
- `lms/lms/utils.py`
- `lms/lms/api.py`

Complexity: `Medium`

### Student Pending Work API

Business Value:

- Enables a true learner task queue.
- Supports reminders, completion nudges, and future AI recommendations.

User Impact:

- Students can quickly find pending quizzes, assignments, certificate actions, and next lesson.

Existing Files To Reuse:

- `frontend/src/pages/Lesson.vue`
- `frontend/src/components/Quiz.vue`
- `frontend/src/components/Assignment.vue`
- `frontend/src/pages/Courses/CourseOverview.vue`
- `lms/lms/utils.py`
- `lms/lms/api.py`
- DocTypes: `LMS Enrollment`, `LMS Course Progress`, `LMS Quiz`, `LMS Quiz Submission`, `LMS Assignment`, `LMS Assignment Submission`, `LMS Certificate`

Complexity: `Medium`

### Instructor Dashboard

Business Value:

- Gives instructors one operational page for managing course health.
- Reduces support/admin dependency.
- Improves course quality and response time on submissions.

User Impact:

- Instructors see created courses, total enrolled students, course progress summary, quiz submissions, assignment submissions, and unpublished courses.

Existing Files To Reuse:

- `frontend/src/pages/Home/AdminHome.vue`
- `frontend/src/pages/Courses/Courses.vue`
- `frontend/src/pages/Courses/CourseDashboard.vue`
- `frontend/src/pages/QuizSubmissionList.vue`
- `frontend/src/pages/AssignmentSubmissionList.vue`
- `frontend/src/components/CourseCard.vue`
- `frontend/src/components/NumberChartGraph.vue`
- `frontend/src/components/ProgressBar.vue`
- `lms/lms/api.py`
- `lms/lms/utils.py`

Complexity: `Medium`

### Instructor Aggregate Dashboard API

Business Value:

- Enables all-course instructor analytics without many frontend calls.
- Creates a reusable base for admin and marketplace analytics later.

User Impact:

- Instructors get faster, clearer reporting across all their courses.

Existing Files To Reuse:

- `lms/lms/api.py`
- `lms/lms/utils.py`
- `frontend/src/pages/Courses/CourseDashboard.vue`
- DocTypes: `LMS Course`, `Course Instructor`, `LMS Enrollment`, `LMS Quiz Submission`, `LMS Assignment Submission`

Complexity: `Medium`

### Continue Learning / Next Lesson

Business Value:

- Directly improves course completion.
- Makes the home/dashboard experience action-oriented.

User Impact:

- Learners can resume the exact next lesson instead of navigating through course pages.

Existing Files To Reuse:

- `frontend/src/pages/Lesson.vue`
- `frontend/src/pages/Courses/CourseOverview.vue`
- `frontend/src/components/CourseCardOverlay.vue`
- `lms/lms/utils.py`
- `lms.lms.utils.get_lesson_index`
- `lms.lms.utils.get_lesson_url`
- DocTypes: `LMS Enrollment`, `Course Lesson`, `Course Chapter`, `LMS Course Progress`

Complexity: `Medium`

### Basic Moderator/Admin Dashboard Separation

Business Value:

- Separates platform operations from instructor operations.
- Reduces role confusion and supports admin analytics expansion.

User Impact:

- Moderators see admin tasks, approvals, certificates, batches, and analytics instead of instructor-like home content.

Existing Files To Reuse:

- `frontend/src/pages/Home/Home.vue`
- `frontend/src/pages/Home/AdminHome.vue`
- `frontend/src/pages/Statistics.vue`
- `frontend/src/pages/Batches/Batches.vue`
- `frontend/src/pages/CertifiedParticipants.vue`
- `frontend/src/pages/ProfileRoles.vue`
- `lms/lms/api.py`

Complexity: `Medium`

### Pending Quizzes And Assignments Queue

Business Value:

- Converts quizzes/assignments from hidden lesson content into actionable work.
- Useful for student dashboard and instructor monitoring.

User Impact:

- Students know exactly what needs to be completed.
- Instructors can track assessment backlog.

Existing Files To Reuse:

- `frontend/src/components/Quiz.vue`
- `frontend/src/components/Assignment.vue`
- `frontend/src/pages/QuizPage.vue`
- `frontend/src/pages/AssignmentSubmission.vue`
- `frontend/src/pages/QuizSubmissionList.vue`
- `frontend/src/pages/AssignmentSubmissionList.vue`
- `lms/lms/api.py`
- `lms/lms/utils.py`

Complexity: `Medium`

## P1 Important

### Improved Admin Analytics

Business Value:

- Gives moderators platform-level insight into enrollment, completion, certificates, revenue, and content quality.
- Supports operational decisions.

User Impact:

- Admins can identify weak courses, inactive learners, and completion bottlenecks.

Existing Files To Reuse:

- `frontend/src/pages/Statistics.vue`
- `frontend/src/pages/Courses/CourseDashboard.vue`
- `frontend/src/pages/Batches/components/AdminBatchDashboard.vue`
- `lms/lms/api.py`
- `lms/lms/utils.py`
- DocTypes: `LMS Enrollment`, `LMS Course`, `LMS Certificate`, `LMS Payment`, `LMS Quiz Submission`, `LMS Assignment Submission`, `LMS Live Class Participant`

Complexity: `High`

### Course Discovery And Basic Recommendations

Business Value:

- Improves course discovery and enrollment conversion.
- Helps learners find relevant courses faster.

User Impact:

- Students see recommended, popular, new, related, and skill/category-based courses.

Existing Files To Reuse:

- `frontend/src/pages/Courses/Courses.vue`
- `frontend/src/pages/Home/StudentHome.vue`
- `frontend/src/components/CourseCard.vue`
- `frontend/src/components/RelatedCourses.vue`
- `frontend/src/pages/Search/Search.vue`
- `lms/lms/utils.py`
- DocTypes: `LMS Course`, `LMS Category`, `Related Courses`, `LMS Enrollment`

Complexity: `Medium`

### Goal / Skill Onboarding

Business Value:

- Moves the product closer to Coursera/Unacademy-style guided learning.
- Improves recommendation quality.

User Impact:

- Learners can pick goals or skills and get a clearer learning path.

Existing Files To Reuse:

- `frontend/src/pages/PersonaForm.vue`
- `frontend/src/pages/Programs/Programs.vue`
- `frontend/src/pages/Programs/ProgramDetail.vue`
- `lms/lms/api.py`
- `lms/lms/utils.py`
- DocTypes: `Skills`, `User Skill`, `LMS Program`, `LMS Program Course`, `LMS Category`

Complexity: `Medium`

### Live Class Engagement MVP

Business Value:

- Makes live classes more competitive with Unacademy-style experiences.
- Improves engagement and attendance value.

User Impact:

- Students can ask questions, respond to polls, and participate during live sessions.
- Instructors get feedback during class.

Existing Files To Reuse:

- `frontend/src/pages/Batches/components/LiveClass.vue`
- `frontend/src/components/Modals/LiveClassModal.vue`
- `frontend/src/components/Modals/LiveClassAttendance.vue`
- `frontend/src/pages/Batches/BatchDetail.vue`
- `lms/lms/api.py`
- DocTypes: `LMS Live Class`, `LMS Live Class Participant`, `LMS Batch`, `LMS Batch Timetable`

Complexity: `High`

### Structured Doubt Solving

Business Value:

- Adds mentor/instructor support workflows expected in Indian upskilling/test-prep products.
- Increases learner confidence and retention.

User Impact:

- Learners can raise doubts from lessons, quizzes, assignments, or live classes.
- Instructors/mentors get a queue and resolution status.

Existing Files To Reuse:

- `frontend/src/components/Discussions.vue`
- `frontend/src/components/DiscussionReplies.vue`
- `frontend/src/components/Modals/DiscussionModal.vue`
- `frontend/src/pages/Lesson.vue`
- `frontend/src/components/Assignment.vue`
- `lms/lms/utils.py`
- DocTypes: `Discussion Topic`, `Discussion Reply`, `Course Lesson`, `LMS Assignment Submission`, `LMS Course Mentor Mapping`

Complexity: `Medium`

### Certificate Sharing And Verification Improvements

Business Value:

- Makes certificates more valuable for employability and marketing.
- Improves public trust in issued credentials.

User Impact:

- Learners can share certificates publicly.
- Employers/admins can verify certificate authenticity.

Existing Files To Reuse:

- `frontend/src/pages/ProfileCertificates.vue`
- `frontend/src/pages/Courses/CourseCertification.vue`
- `frontend/src/pages/CertifiedParticipants.vue`
- `lms/lms/doctype/lms_certificate/lms_certificate.py`
- `lms/lms/api.py`
- DocTypes: `LMS Certificate`, `LMS Certificate Request`, `LMS Certificate Evaluation`

Complexity: `Medium`

### Basic Marketplace / Revenue Analytics

Business Value:

- Supports paid course operations and instructor monetization.
- Helps admins understand what sells.

User Impact:

- Instructors and moderators can see revenue, enrollments, and conversion indicators.

Existing Files To Reuse:

- `frontend/src/pages/Statistics.vue`
- `frontend/src/pages/Billing.vue`
- `frontend/src/pages/Courses/CourseDashboard.vue`
- `lms/lms/api.py`
- `lms/lms/utils.py`
- DocTypes: `LMS Payment`, `LMS Coupon`, `LMS Coupon Item`, `LMS Enrollment`, `LMS Course`

Complexity: `High`

### Mobile PWA Improvements

Business Value:

- Improves access for learners who primarily use mobile.
- Better aligns with Udemy/Coursera/Unacademy/PW usage patterns.

User Impact:

- Better installability, mobile navigation, offline shell, and reminder readiness.

Existing Files To Reuse:

- `frontend/src/components/Layouts/MobileLayout.vue`
- `frontend/src/router.js`
- `lms/lms/api.py`
- `lms.lms.api.get_pwa_manifest`
- Existing PWA manifest support

Complexity: `Medium`

## P2 Nice To Have

### AI Lesson Assistant

Business Value:

- Differentiates the LMS and improves perceived learning support.
- Opens path to AI recommendations, summaries, and quiz explanations.

User Impact:

- Learners can ask contextual questions about a lesson.
- Learners get simpler explanations without leaving the course.

Existing Files To Reuse:

- `frontend/src/pages/Lesson.vue`
- `frontend/src/components/Discussions.vue`
- `frontend/src/components/Quiz.vue`
- `lms/lms/utils.py`
- `lms/lms/api.py`
- DocTypes: `Course Lesson`, `LMS Course`, `LMS Question`, `LMS Quiz`

Complexity: `High`

### AI Quiz Feedback And Explanations

Business Value:

- Improves learning outcomes after assessment.
- Reduces instructor support load for common mistakes.

User Impact:

- Students understand why answers are wrong.
- Quiz review becomes educational, not only evaluative.

Existing Files To Reuse:

- `frontend/src/components/Quiz.vue`
- `frontend/src/pages/QuizSubmission.vue`
- `frontend/src/pages/QuizPage.vue`
- `lms/lms/doctype/lms_quiz/lms_quiz.py`
- `lms/lms/doctype/lms_quiz_submission/lms_quiz_submission.py`
- DocTypes: `LMS Quiz`, `LMS Quiz Submission`, `LMS Quiz Result`, `LMS Question`

Complexity: `High`

### Test Series / Mock Test Module

Business Value:

- Expands LMS into test-prep and certification-prep markets.
- Competes better with Unacademy/PW-style products.

User Impact:

- Learners can take timed tests, see reports, weak topics, and attempt history.

Existing Files To Reuse:

- `frontend/src/pages/Quizzes.vue`
- `frontend/src/pages/QuizForm.vue`
- `frontend/src/pages/QuizPage.vue`
- `frontend/src/components/Quiz.vue`
- `frontend/src/pages/QuizSubmission.vue`
- `lms/lms/doctype/lms_quiz`
- `lms/lms/doctype/lms_quiz_submission`
- DocTypes: `LMS Quiz`, `LMS Question`, `LMS Quiz Submission`, `LMS Quiz Result`

Complexity: `High`

### Skill Path / Career Path Layer

Business Value:

- Enables Coursera-style skills tracks and PW-style job-skill programs.
- Supports personalized recommendations and progress analytics.

User Impact:

- Learners know what to study next for a goal or career outcome.

Existing Files To Reuse:

- `frontend/src/pages/Programs/Programs.vue`
- `frontend/src/pages/Programs/ProgramDetail.vue`
- `frontend/src/pages/Programs/ProgramProgressSummary.vue`
- `frontend/src/pages/Profile.vue`
- `lms/lms/utils.py`
- DocTypes: `Skills`, `User Skill`, `LMS Program`, `LMS Program Course`, `LMS Program Member`, `LMS Course`

Complexity: `High`

### Leaderboards / XP / Weekly Challenges

Business Value:

- Improves engagement in cohorts, batches, and test-prep flows.

User Impact:

- Learners get motivation through progress, competition, and weekly goals.

Existing Files To Reuse:

- `frontend/src/pages/Home/Streak.vue`
- `frontend/src/components/Settings/BadgeAssignments.vue`
- `frontend/src/components/Settings/BadgeAssignmentForm.vue`
- `lms/lms/api.py`
- DocTypes: `LMS Badge`, `LMS Badge Assignment`, `LMS Course Progress`, `LMS Quiz Submission`

Complexity: `Medium`

### Semantic Search And AI Summaries

Business Value:

- Improves content discovery in large catalogs.
- Adds modern AI-powered learning support.

User Impact:

- Learners can search by meaning, not exact keywords.
- Learners can get summaries of lessons, courses, and notes.

Existing Files To Reuse:

- `frontend/src/pages/Search/Search.vue`
- `lms/sqlite.py`
- `lms/lms/utils.py`
- `lms/lms/api.py`
- DocTypes: `LMS Course`, `Course Lesson`, `LMS Lesson Note`, `Discussion Topic`

Complexity: `High`

### Content Versioning And Authoring Templates

Business Value:

- Improves quality control for larger content teams.
- Reduces accidental content regressions.

User Impact:

- Instructors can use templates and recover previous versions.

Existing Files To Reuse:

- `frontend/src/pages/Courses/CourseEditor.vue`
- `frontend/src/pages/LessonForm.vue`
- `frontend/src/pages/Courses/CourseForm.vue`
- `lms/lms/doctype/course_lesson/course_lesson.py`
- `lms/lms/doctype/lms_course/lms_course.py`
- DocTypes: `LMS Course`, `Course Lesson`, `Course Chapter`

Complexity: `High`

## 1 Month Roadmap

Goal: create clear role-based dashboards and next-action learner/instructor flows.

Capacity assumption:

- Product Designer: dashboard UX, empty states, mobile states, role navigation.
- Frontend Developer: new routes/pages, resource wiring, responsive dashboard UI.
- Backend Developer: dashboard APIs, permission checks, aggregation queries.

### Month 1 Deliverables

| Week | Deliverable | Priority | Owner Focus | Complexity |
| --- | --- | --- | --- | --- |
| 1 | Student dashboard UX spec and route shell | P0 | Designer + Frontend | Medium |
| 1 | Instructor dashboard UX spec and route shell | P0 | Designer + Frontend | Medium |
| 1 | Dashboard API contracts | P0 | Backend + Frontend | Medium |
| 2 | Student dashboard enrolled courses, continue learning, progress, certificates | P0 | Frontend + Backend | Medium |
| 2 | Student pending quizzes/assignments API | P0 | Backend | Medium |
| 3 | Instructor dashboard created/unpublished courses and summary cards | P0 | Frontend + Backend | Medium |
| 3 | Instructor aggregate API for enrollments, progress, submissions | P0 | Backend | Medium |
| 4 | Sidebar links and guarded routing for student/instructor dashboards | P0 | Frontend | Low |
| 4 | Basic moderator/admin home separation plan or minimal shell | P0 | Designer + Frontend | Medium |
| 4 | QA pass for student, instructor, moderator, empty states, permission leakage | P0 | Full team | Medium |

Month 1 success criteria:

- Students can open `/student-dashboard`.
- Instructors can open `/instructor-dashboard`.
- Dashboard data is scoped to the logged-in user.
- No existing `/`, `/courses`, lessons, quizzes, assignments, or certificates flows regress.
- Pending quizzes/assignments are visible for students.
- Instructor dashboard shows aggregate metrics without excessive frontend API calls.

Features intentionally deferred:

- AI assistant.
- Test series.
- Advanced admin analytics.
- Live polls/chat.
- Marketplace revenue reporting.

## 3 Month Roadmap

Goal: improve admin visibility, engagement, and learner guidance after dashboards are stable.

### Month 2 Deliverables

| Deliverable | Priority | Business Outcome | Complexity |
| --- | --- | --- | --- |
| Moderator/admin dashboard v1 | P0 | Clear admin operations for approvals, batches, certificates, platform stats | Medium |
| Improved admin analytics v1 | P1 | Better visibility into enrollments, completions, certificates, inactive learners | High |
| Continue-learning refinements and reminders | P0 | Better completion and return visits | Medium |
| Course discovery/recommendation basics | P1 | Better enrollment conversion | Medium |
| Certificate verification/sharing improvements | P1 | More valuable learner credentials | Medium |

### Month 3 Deliverables

| Deliverable | Priority | Business Outcome | Complexity |
| --- | --- | --- | --- |
| Goal/skill onboarding v1 | P1 | More personalized learner journeys | Medium |
| Structured doubt solving MVP | P1 | Better support and retention | Medium |
| Live class engagement MVP: chat/doubt queue or polls | P1 | More interactive cohorts/live classes | High |
| Basic marketplace/revenue analytics discovery phase | P1 | Define monetization reporting without overbuilding | Medium |
| Mobile PWA usability improvements | P1 | Better mobile learner experience | Medium |

3 month success criteria:

- Each major role has a clear dashboard.
- Admins can see platform health beyond simple counts.
- Learners get recommendations and next steps.
- Doubts can be tracked as a workflow, not just unstructured discussion.
- Live classes have at least one engagement primitive: chat, polls, or doubt queue.
- Certificate sharing/verification is visibly improved.

## 6 Month Roadmap

Goal: add competitive differentiation while preserving maintainability for a small team.

### Months 4-6 Deliverables

| Deliverable | Priority | Business Outcome | Complexity |
| --- | --- | --- | --- |
| Test series / mock test MVP | P2 | Enter test-prep use cases and improve practice depth | High |
| Skill path / career path layer v1 | P2 | Coursera/PW-style structured learning paths | High |
| AI lesson assistant pilot | P2 | Modern learner support and differentiation | High |
| AI quiz feedback pilot | P2 | Better assessment learning outcomes | High |
| Marketplace/revenue analytics v1 | P1 | Paid course and instructor monetization visibility | High |
| Advanced admin analytics v2 | P1 | Funnel, retention, course quality, revenue insights | High |
| PWA offline shell and push-notification readiness | P1 | Stronger mobile learning | Medium |
| Gamification v1: goals, XP, or leaderboards for batches/test series | P2 | Engagement and cohort motivation | Medium |

6 month success criteria:

- Product has strong student, instructor, and admin dashboards.
- Analytics cover learners, instructors, moderators, and paid course operations.
- Learners can follow goals or skill paths.
- A test-prep MVP exists if that market is a target.
- AI is piloted in narrow, auditable areas instead of spread across the product.
- Mobile/PWA experience is meaningfully better than responsive web alone.

## What Not To Build First

Do not start with these before P0 dashboards are complete:

- Full AI tutor platform.
- Native mobile apps.
- Complex payout/commission system.
- Full semantic search.
- Large gamification system.
- Complete test-prep platform.

Reason:

- The current biggest gap is operational clarity, not lack of exotic features.
- Dashboards and aggregate APIs unlock most later work.
- A small team needs reusable data foundations before advanced product layers.

## Recommended Execution Order

1. Student dashboard.
2. Student pending work and next lesson APIs.
3. Instructor dashboard.
4. Instructor aggregate analytics API.
5. Moderator dashboard and admin analytics v1.
6. Goal/skill onboarding and recommendations.
7. Structured doubt solving.
8. Live class engagement.
9. Certificate sharing/verification.
10. Marketplace/revenue analytics.
11. Test series and skill paths.
12. AI assistant and AI quiz feedback.
13. Mobile/offline/push improvements.
14. Gamification and semantic search.

## Risk Notes

- Permission leakage is the biggest technical risk for dashboards and analytics. Every aggregate API must scope by current user and role.
- Instructor and moderator dashboards should not share broad data accidentally.
- AI features should not write directly into course content without instructor approval.
- Test-series features should reuse quizzes where possible but avoid breaking existing quiz attempts.
- Live engagement can become large quickly; start with one primitive, not chat, polls, Q&A, reactions, and analytics all at once.
- Mobile offline support depends on content type and licensing; begin with shell caching and saved state before media downloads.

## Final Recommendation

For this team size, the realistic product strategy is:

- Month 1: make role dashboards usable.
- Month 3: make analytics and engagement credible.
- Month 6: add differentiated AI, skill paths, test-prep, and marketplace depth.

This keeps the roadmap aligned with the existing Frappe LMS architecture while addressing the most visible competitive gaps first.
