<template>
	<div class="mt-10 min-h-screen min-w-0 overflow-x-hidden bg-surface-gray-1 pb-24 md:bg-transparent md:pb-0">
		<div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div class="min-w-0">
				<h1 class="break-words text-2xl font-semibold text-ink-gray-9">
					{{ __('Instructor Dashboard') }}
				</h1>
				<p class="mt-1 text-base text-ink-gray-6">
					{{ __('Course activity and evaluation overview.') }}
				</p>
				<p class="mt-1 text-sm text-ink-gray-5">
					{{ __('Last updated') }}: {{ lastUpdatedLabel }}
				</p>
			</div>
			<button
				v-if="canViewDashboard"
				type="button"
				class="inline-flex w-fit items-center gap-2 rounded border border-outline-gray-2 bg-surface-white px-3 py-2 text-sm font-medium text-ink-gray-8 transition hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3 disabled:cursor-not-allowed disabled:opacity-70"
				:disabled="instructorMetrics.loading"
				@click="refreshInstructorMetrics"
			>
				<RefreshCw class="size-4 shrink-0 stroke-1.5" />
				<span>{{ instructorMetrics.loading ? __('Refreshing...') : __('Refresh') }}</span>
			</button>
		</div>

		<div v-if="rolesLoading" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
			<section
				v-for="index in 6"
				:key="index"
				class="min-h-36 rounded-md border bg-surface-white p-4"
			>
				<div class="h-6 w-36 animate-pulse rounded bg-surface-gray-2"></div>
				<div class="mt-5 space-y-3">
					<div class="h-8 w-24 animate-pulse rounded bg-surface-gray-2"></div>
					<div class="h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
					<div class="h-4 w-1/2 animate-pulse rounded bg-surface-gray-2"></div>
				</div>
			</section>
		</div>

		<div
			v-else-if="canViewDashboard"
		>
			<div
				v-if="isInitialMetricsError"
				role="alert"
				class="rounded-md border border-outline-gray-2 bg-surface-white p-4"
			>
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0">
						<h2 class="text-base font-semibold text-ink-gray-9">
							{{ __('Unable to load instructor dashboard') }}
						</h2>
						<p class="mt-1 text-sm text-ink-gray-6">
							{{ __('Please check your connection and try again.') }}
						</p>
					</div>
					<button
						type="button"
						class="inline-flex w-fit items-center gap-2 rounded border border-outline-gray-2 bg-surface-white px-3 py-2 text-sm font-medium text-ink-gray-8 transition hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3 disabled:cursor-not-allowed disabled:opacity-70"
						:disabled="instructorMetrics.loading"
						@click="refreshInstructorMetrics"
					>
						<RefreshCw class="size-4 shrink-0 stroke-1.5" />
						<span>{{ instructorMetrics.loading ? __('Retrying...') : __('Retry') }}</span>
					</button>
				</div>
			</div>
			<template v-else>
				<div
					v-if="hasRefreshError"
					role="status"
					class="mb-5 rounded border border-dashed border-outline-gray-2 bg-surface-white p-3 text-sm text-ink-gray-6"
				>
					{{ __('Unable to refresh instructor dashboard. Existing data is still shown.') }}
				</div>
			<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				<section
					v-for="card in cards"
					:key="card.title"
					class="min-h-36 min-w-0 rounded-md border bg-surface-white p-4"
				>
					<div class="flex flex-wrap items-center justify-between gap-3">
						<h2 class="min-w-0 break-words text-lg font-semibold text-ink-gray-9">
							{{ __(card.title) }}
						</h2>
						<div
							class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-gray-2 text-sm font-medium text-ink-gray-7"
						>
							{{ card.index }}
						</div>
					</div>

					<div class="mt-5">
					<template v-if="card.key === 'my-courses'">
						<div class="text-3xl font-semibold text-ink-gray-9">
							{{ getInstructorMetricValue('my_course_count') }}
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ __(card.label) }}
						</div>
						<div
							v-if="!instructorMetrics.loading && !instructorMetrics.error"
							class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('Created courses in your workspace') }}
						</div>
					</template>

					<template v-else-if="card.key === 'total-learners'">
						<div class="text-3xl font-semibold text-ink-gray-9">
							{{ getInstructorMetricValue('total_unique_learners') }}
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ __(card.label) }}
						</div>
						<div
							v-if="!instructorMetrics.loading && !instructorMetrics.error"
							class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('Unique learners across your courses') }}
						</div>
					</template>

					<template v-else-if="card.key === 'average-course-progress'">
						<div class="text-3xl font-semibold text-ink-gray-9">
							{{ getInstructorMetricValue('average_course_progress', '%') }}
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ __(card.label) }}
						</div>
						<div
							v-if="!instructorMetrics.loading && !instructorMetrics.error"
							class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('Average learner completion across all courses') }}
						</div>
					</template>

					<template v-else-if="card.key === 'pending-evaluations'">
						<div class="text-3xl font-semibold text-ink-gray-9">
							{{ getInstructorMetricValue('pending_evaluations_count') }}
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ __('Items waiting for review') }}
						</div>
						<div
							v-if="isInitialMetricsLoading"
							class="mt-4 text-sm text-ink-gray-5"
						>
							...
						</div>
						<div
							v-else-if="isInitialMetricsError"
							class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('Unable to load pending evaluations') }}
						</div>
						<div
							v-else-if="!pendingEvaluations.length"
							class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('No pending evaluations') }}
						</div>
						<div v-else class="mt-4 space-y-3">
							<div
								v-for="(submission, index) in pendingEvaluations"
								:key="`${submission.submission_type}-${submission.submitted_at}-${index}`"
								class="border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
							>
								<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div class="min-w-0">
										<div class="break-words text-sm font-medium text-ink-gray-9 sm:truncate">
											{{ submission.student_name || __('Unknown Student') }}
										</div>
										<div class="mt-1 break-words text-xs text-ink-gray-6 sm:truncate">
											{{ submission.course_name || __('Course') }}
										</div>
										<div class="mt-1 break-words text-xs text-ink-gray-7 sm:truncate">
											{{ submission.submission_title || __('Submission') }}
										</div>
										<div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-gray-5">
											<span>{{ submission.submission_type || __('Submission') }}</span>
											<span>{{ formatSubmissionTime(submission.submitted_at) }}</span>
										</div>
									</div>
									<span
										class="w-fit shrink-0 rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
									>
										{{ submission.status || __('Pending') }}
									</span>
								</div>
							</div>
						</div>
					</template>

					<template v-else-if="card.key === 'recent-submissions'">
						<div
							v-if="isInitialMetricsLoading"
							class="space-y-3"
						>
							<div
								v-for="index in 3"
								:key="index"
								class="h-12 animate-pulse rounded bg-surface-gray-2"
							></div>
						</div>
						<div
							v-else-if="isInitialMetricsError"
							class="rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('Unable to load recent submissions') }}
						</div>
						<div
							v-else-if="!recentSubmissions.length"
							class="rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('No recent submissions') }}
						</div>
						<div v-else class="space-y-3">
							<div
								v-for="submission in recentSubmissions"
								:key="`${submission.type}-${submission.name}`"
								class="border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
							>
								<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div class="min-w-0">
										<div class="break-words text-sm font-medium text-ink-gray-9 sm:truncate">
											{{ submission.student_name || __('Unknown Student') }}
										</div>
										<div class="mt-1 break-words text-xs text-ink-gray-6 sm:truncate">
											{{ submission.course_name || __('Course') }}
										</div>
										<div class="mt-1 break-words text-xs text-ink-gray-7 sm:truncate">
											{{ submission.submission_title || __('Submission') }}
										</div>
										<div class="mt-1 text-xs text-ink-gray-5">
											{{ formatSubmissionTime(submission.submitted_at) }}
										</div>
									</div>
									<span
										class="w-fit shrink-0 rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
									>
										{{ submission.status || __('Submitted') }}
									</span>
								</div>
							</div>
						</div>
					</template>

					<template v-else-if="card.key === 'course-performance'">
						<div
							v-if="isInitialMetricsLoading"
							class="space-y-3"
						>
							<div
								v-for="index in 3"
								:key="index"
								class="space-y-2"
							>
								<div class="h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
								<div class="h-2 w-full animate-pulse rounded bg-surface-gray-2"></div>
								<div class="h-3 w-1/2 animate-pulse rounded bg-surface-gray-2"></div>
							</div>
						</div>
						<div
							v-else-if="isInitialMetricsError"
							class="rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('Unable to load course performance') }}
						</div>
						<div
							v-else-if="!coursePerformance.length"
							class="rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('No course performance data') }}
						</div>
						<div v-else class="space-y-4">
							<div
								v-for="course in coursePerformance"
								:key="course.course_title"
								class="space-y-2"
							>
								<div class="break-words text-sm font-medium text-ink-gray-9 sm:truncate">
									{{ course.course_title || __('Untitled Course') }}
								</div>
								<div class="h-2 overflow-hidden rounded bg-surface-gray-2">
									<div
										class="h-full rounded bg-blue-500"
										:style="{ width: `${getProgressWidth(course.completion_percentage)}%` }"
									></div>
								</div>
								<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-gray-6">
									<span>{{ __('Completion') }}: {{ course.completion_percentage || 0 }}%</span>
									<span>{{ __('Average score') }}: {{ course.average_score || 0 }}%</span>
									<span>{{ course.learner_count || 0 }} {{ __('learners') }}</span>
								</div>
							</div>
						</div>
					</template>

					<template v-else>
						<div class="text-3xl font-semibold text-ink-gray-9">
							--
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ __(card.label) }}
						</div>
						<div
							class="mt-4 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
						>
							{{ __('Data will load in next phase') }}
						</div>
					</template>
					</div>
				</section>
			</div>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 class="text-lg font-semibold text-ink-gray-9">
							{{ __('Learner Growth') }}
						</h2>
						<p class="mt-1 text-sm text-ink-gray-6">
							{{ __('Enrollments over the last 6 months') }}
						</p>
					</div>
				</div>

				<div
					v-if="isInitialMetricsLoading"
					class="mt-5 grid h-36 grid-cols-6 items-end gap-2 sm:gap-3"
				>
					<div
						v-for="index in 6"
						:key="index"
						class="flex h-full min-w-0 flex-col justify-end gap-2"
					>
						<div class="h-4 w-8 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-3/4 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-4 animate-pulse rounded bg-surface-gray-2"></div>
					</div>
				</div>
				<div
					v-else-if="isInitialMetricsError"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('Unable to load learner growth') }}
				</div>
				<div
					v-else-if="!hasLearnerGrowthActivity"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No enrollment activity yet') }}
				</div>
				<div v-else class="mt-5 grid h-44 grid-cols-6 items-end gap-2 sm:gap-3">
					<div
						v-for="month in learnerGrowth"
						:key="month.label"
						class="flex h-full min-w-0 flex-col items-center justify-end gap-2"
					>
						<div class="text-sm font-medium text-ink-gray-9">
							{{ month.count || 0 }}
						</div>
						<div class="flex h-28 w-full items-end border-b border-outline-gray-2">
							<div
								v-if="Number(month.count) > 0"
								class="w-full rounded-t bg-blue-500"
								:style="{ height: `${getLearnerGrowthHeight(month.count)}%` }"
							></div>
						</div>
						<div class="max-w-full break-words text-center text-xs text-ink-gray-6">
							{{ month.label }}
						</div>
					</div>
				</div>
			</section>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<div>
					<h2 class="text-lg font-semibold text-ink-gray-9">
						{{ __('Instructor Notifications') }}
					</h2>
				</div>

				<div
					v-if="isInitialMetricsLoading"
					class="mt-5 space-y-3"
				>
					<div
						v-for="index in 3"
						:key="index"
						class="space-y-2 border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="h-5 w-32 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-3 w-1/2 animate-pulse rounded bg-surface-gray-2"></div>
					</div>
				</div>
				<div
					v-else-if="isInitialMetricsError"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('Unable to load instructor notifications') }}
				</div>
				<div
					v-else-if="!instructorNotifications.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No recent instructor activity') }}
				</div>
				<div v-else class="mt-5 space-y-3">
					<div
						v-for="(notification, index) in instructorNotifications"
						:key="`${notification.type}-${notification.created_at}-${index}`"
						class="border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<span
										class="rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
									>
										{{ __(notification.type || 'Activity') }}
									</span>
									<span class="text-xs text-ink-gray-5">
										{{ formatSubmissionTime(notification.created_at) }}
									</span>
								</div>
								<div class="mt-2 break-words text-sm font-medium text-ink-gray-9 sm:truncate">
									{{ notification.message || __('Instructor activity') }}
								</div>
								<div class="mt-1 break-words text-xs text-ink-gray-6 sm:truncate">
									{{ notification.course_name || __('Course') }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<h2 class="text-lg font-semibold text-ink-gray-9">
					{{ __('Quick Actions') }}
				</h2>
				<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
					<router-link
						v-for="action in activeQuickActions"
						:key="action.label"
						:to="action.to"
						class="flex min-h-20 w-full min-w-0 items-start gap-3 rounded border border-outline-gray-2 p-3 text-left transition hover:border-outline-gray-3 hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3"
					>
						<component
							:is="action.icon"
							class="mt-0.5 size-4 shrink-0 stroke-1.5 text-ink-gray-7"
						/>
						<div class="min-w-0">
							<div class="break-words text-sm font-medium text-ink-gray-9">
								{{ __(action.label) }}
							</div>
							<div class="mt-1 break-words text-xs text-ink-gray-5">
								{{ __(action.description) }}
							</div>
						</div>
					</router-link>
					<button
						v-for="action in disabledQuickActions"
						:key="action.label"
						type="button"
						disabled
						class="flex min-h-20 w-full min-w-0 cursor-not-allowed items-start gap-3 rounded border border-outline-gray-1 bg-surface-gray-1 p-3 text-left opacity-75"
					>
						<component
							:is="action.icon"
							class="mt-0.5 size-4 shrink-0 stroke-1.5 text-ink-gray-5"
						/>
						<div class="min-w-0">
							<div class="break-words text-sm font-medium text-ink-gray-7">
								{{ __(action.label) }}
							</div>
							<div class="mt-1 break-words text-xs text-ink-gray-5">
								{{ __('Coming soon') }}
							</div>
						</div>
					</button>
				</div>
			</section>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<h2 class="text-lg font-semibold text-ink-gray-9">
					{{ __('Recent Learners') }}
				</h2>

				<div
					v-if="isInitialMetricsLoading"
					class="mt-5 space-y-3"
				>
					<div
						v-for="index in 3"
						:key="index"
						class="space-y-2 border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="h-4 w-40 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-3 w-2/3 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-3 w-1/2 animate-pulse rounded bg-surface-gray-2"></div>
					</div>
				</div>
				<div
					v-else-if="isInitialMetricsError"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('Unable to load recent learners') }}
				</div>
				<div
					v-else-if="!recentLearners.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No recent learners') }}
				</div>
				<div v-else class="mt-5 space-y-3">
					<div
						v-for="(learner, index) in recentLearners"
						:key="`${learner.learner_name}-${learner.enrolled_at}-${index}`"
						class="border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0">
								<div class="break-words text-sm font-medium text-ink-gray-9 sm:truncate">
									{{ learner.learner_name || __('Learner') }}
								</div>
								<div class="mt-1 break-words text-xs text-ink-gray-6 sm:truncate">
									{{ learner.course_name || __('Course') }}
								</div>
								<div class="mt-1 text-xs text-ink-gray-5">
									{{ formatSubmissionTime(learner.enrolled_at) }}
								</div>
							</div>
							<div class="w-full shrink-0 text-xs font-medium text-ink-gray-7 sm:w-auto sm:text-right">
								{{ __('Progress') }}: {{ learner.progress || 0 }}%
							</div>
						</div>
						<div class="mt-3 h-2 overflow-hidden rounded bg-surface-gray-2">
							<div
								class="h-full rounded bg-blue-500"
								:style="{ width: `${getProgressWidth(learner.progress)}%` }"
							></div>
						</div>
					</div>
				</div>
			</section>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<h2 class="text-lg font-semibold text-ink-gray-9">
					{{ __('Upcoming Schedule') }}
				</h2>
				<p class="mt-1 text-sm text-ink-gray-6">
					{{ __('Upcoming batch dates and certificate evaluations') }}
				</p>

				<div
					v-if="isInitialMetricsLoading"
					class="mt-5 space-y-3"
				>
					<div
						v-for="index in 3"
						:key="index"
						class="space-y-2 border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="h-5 w-32 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-3 w-1/2 animate-pulse rounded bg-surface-gray-2"></div>
					</div>
				</div>
				<div
					v-else-if="isInitialMetricsError"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('Unable to load upcoming schedule') }}
				</div>
				<div
					v-else-if="!instructorCalendar.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No upcoming schedule items') }}
				</div>
				<div v-else class="mt-5 space-y-3">
					<div
						v-for="(event, index) in instructorCalendar"
						:key="`${event.type}-${event.date}-${event.start_time}-${index}`"
						class="border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<span
										class="rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
									>
										{{ __(event.type || 'Schedule') }}
									</span>
									<span
										v-if="event.status"
										class="rounded bg-surface-gray-2 px-2 py-1 text-xs font-medium text-ink-gray-7"
									>
										{{ __(event.status) }}
									</span>
								</div>
								<div class="mt-2 break-words text-sm font-medium text-ink-gray-9 sm:truncate">
									{{ event.title || __('Schedule item') }}
								</div>
								<div
									v-if="event.course_name"
									class="mt-1 break-words text-xs text-ink-gray-6 sm:truncate"
								>
									{{ event.course_name }}
								</div>
							</div>
							<div class="w-full shrink-0 text-left text-xs text-ink-gray-6 sm:w-auto sm:text-right">
								<div class="font-medium text-ink-gray-8">
									{{ formatScheduleDate(event.date) }}
								</div>
								<div v-if="event.start_time || event.end_time" class="mt-1">
									{{ formatScheduleTimeRange(event.start_time, event.end_time) }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0">
						<h2 class="text-lg font-semibold text-ink-gray-9">
							{{ __('Learners Needing Attention') }}
						</h2>
						<p class="mt-1 text-sm text-ink-gray-6">
							{{ __('Learners below 50% course progress') }}
						</p>
					</div>
					<button
						type="button"
						class="inline-flex w-fit items-center gap-2 rounded border border-outline-gray-2 bg-surface-white px-3 py-2 text-sm font-medium text-ink-gray-8 transition hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3 disabled:cursor-not-allowed disabled:opacity-70"
						:disabled="!learnersNeedingAttention.length"
						@click="exportLearnersNeedingAttentionCsv"
					>
						<Download class="size-4 shrink-0 stroke-1.5" />
						<span>{{ __('Export CSV') }}</span>
					</button>
				</div>

				<div
					v-if="isInitialMetricsLoading"
					class="mt-5 space-y-3"
				>
					<div
						v-for="index in 3"
						:key="index"
						class="space-y-2 border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="h-5 w-40 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-4 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-2 w-full animate-pulse rounded bg-surface-gray-2"></div>
					</div>
				</div>
				<div
					v-else-if="isInitialMetricsError"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('Unable to load learners needing attention') }}
				</div>
				<div
					v-else-if="!learnersNeedingAttention.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No learners need attention right now') }}
				</div>
				<div v-else class="mt-5 space-y-3">
					<div
						v-for="(learner, index) in learnersNeedingAttention"
						:key="`${learner.learner_name}-${learner.enrolled_at}-${index}`"
						class="border-b border-outline-gray-1 pb-3 last:border-b-0 last:pb-0"
					>
						<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
							<div class="min-w-0">
								<div class="break-words text-sm font-medium text-ink-gray-9 sm:truncate">
									{{ learner.learner_name || __('Learner') }}
								</div>
								<div class="mt-1 break-words text-xs text-ink-gray-6 sm:truncate">
									{{ learner.course_name || __('Course') }}
								</div>
							</div>
							<div class="w-full shrink-0 text-xs text-ink-gray-6 sm:w-auto sm:text-right">
								<div class="font-medium text-ink-gray-8">
									{{ __('Progress') }}: {{ learner.progress || 0 }}%
								</div>
								<div class="mt-1">
									{{ formatSubmissionTime(learner.enrolled_at) }}
								</div>
							</div>
						</div>
						<div class="mt-3 h-2 overflow-hidden rounded bg-surface-gray-2">
							<div
								class="h-full rounded bg-blue-500"
								:style="{ width: `${getProgressWidth(learner.progress)}%` }"
							></div>
						</div>
					</div>
				</div>
			</section>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-0">
						<h2 class="text-lg font-semibold text-ink-gray-9">
							{{ __('Course Completion Breakdown') }}
						</h2>
						<p class="mt-1 text-sm text-ink-gray-6">
							{{ __('Learner status based on current course progress') }}
						</p>
					</div>
					<button
						type="button"
						class="inline-flex w-fit items-center gap-2 rounded border border-outline-gray-2 bg-surface-white px-3 py-2 text-sm font-medium text-ink-gray-8 transition hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3 disabled:cursor-not-allowed disabled:opacity-70"
						:disabled="!courseCompletionBreakdown.length"
						@click="exportCourseCompletionCsv"
					>
						<Download class="size-4 shrink-0 stroke-1.5" />
						<span>{{ __('Export CSV') }}</span>
					</button>
				</div>

				<div class="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div class="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
						<div class="min-w-0">
							<label class="mb-1 block text-xs font-medium text-ink-gray-6">
								{{ __('Search') }}
							</label>
							<div class="flex min-w-0 gap-2">
								<input
									v-model="completionBreakdownSearch"
									type="search"
									class="min-w-0 flex-1 rounded border border-outline-gray-2 bg-surface-white px-3 py-2 text-sm text-ink-gray-8 placeholder-ink-gray-4 focus:border-outline-gray-4 focus:outline-none focus:ring-2 focus:ring-outline-gray-3"
									:placeholder="__('Search courses')"
								/>
								<button
									v-if="completionBreakdownSearch"
									type="button"
									class="shrink-0 rounded border border-outline-gray-2 bg-surface-white px-3 py-2 text-sm font-medium text-ink-gray-8 transition hover:bg-surface-gray-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-outline-gray-3"
									@click="completionBreakdownSearch = ''"
								>
									{{ __('Clear') }}
								</button>
							</div>
						</div>
						<div class="min-w-0">
							<label class="mb-1 block text-xs font-medium text-ink-gray-6">
								{{ __('Sort') }}
							</label>
							<select
								v-model="completionBreakdownSort"
								class="w-full rounded border border-outline-gray-2 bg-surface-white px-3 py-2 text-sm text-ink-gray-8 focus:border-outline-gray-4 focus:outline-none focus:ring-2 focus:ring-outline-gray-3"
							>
								<option value="default">{{ __('Default Order') }}</option>
								<option value="most-learners">{{ __('Most Learners') }}</option>
								<option value="highest-completion">{{ __('Highest Completion') }}</option>
								<option value="lowest-completion">{{ __('Lowest Completion') }}</option>
								<option value="course-title">{{ __('Course Title A–Z') }}</option>
							</select>
						</div>
					</div>
				</div>

				<div
					v-if="isInitialMetricsLoading"
					class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2"
				>
					<div
						v-for="index in 2"
						:key="index"
						class="space-y-3 rounded border border-outline-gray-1 p-3"
					>
						<div class="h-5 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="grid grid-cols-2 gap-2">
							<div class="h-10 animate-pulse rounded bg-surface-gray-2"></div>
							<div class="h-10 animate-pulse rounded bg-surface-gray-2"></div>
							<div class="h-10 animate-pulse rounded bg-surface-gray-2"></div>
							<div class="h-10 animate-pulse rounded bg-surface-gray-2"></div>
						</div>
					</div>
				</div>
				<div
					v-else-if="isInitialMetricsError"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('Unable to load course completion breakdown') }}
				</div>
				<div
					v-else-if="!courseCompletionBreakdown.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No instructor courses yet') }}
				</div>
				<div
					v-else-if="!filteredCourseCompletionBreakdown.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No courses match your search') }}
				</div>
				<div v-else class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
					<div
						v-for="course in filteredCourseCompletionBreakdown"
						:key="course.course_name"
						class="min-w-0 rounded border border-outline-gray-1 p-3"
					>
						<div class="break-words text-sm font-medium text-ink-gray-9">
							{{ course.course_title || __('Untitled Course') }}
						</div>
						<div class="mt-3">
							<div class="flex flex-col gap-1 text-xs text-ink-gray-6 sm:flex-row sm:items-center sm:justify-between">
								<span v-if="Number(course.total_learners) > 0" class="font-medium text-ink-gray-8">
									{{ __('Completion Rate') }}: {{ getCompletionRate(course) }}%
								</span>
								<span v-else class="font-medium text-ink-gray-8">
									{{ __('No learners enrolled yet') }}
								</span>
							</div>
							<div class="mt-2 h-2 overflow-hidden rounded bg-surface-gray-2">
								<div
									class="h-full rounded bg-blue-500"
									:style="{ width: `${getCompletionRate(course)}%` }"
								></div>
							</div>
						</div>
						<div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
							<div class="rounded bg-surface-gray-1 p-2">
								<div class="text-xs text-ink-gray-5">{{ __('Total learners') }}</div>
								<div class="mt-1 text-sm font-semibold text-ink-gray-9">
									{{ course.total_learners || 0 }}
								</div>
							</div>
							<div class="rounded bg-surface-gray-1 p-2">
								<div class="text-xs text-ink-gray-5">{{ __('Completed') }}</div>
								<div class="mt-1 text-sm font-semibold text-ink-gray-9">
									{{ course.completed_count || 0 }}
								</div>
							</div>
							<div class="rounded bg-surface-gray-1 p-2">
								<div class="text-xs text-ink-gray-5">{{ __('In Progress') }}</div>
								<div class="mt-1 text-sm font-semibold text-ink-gray-9">
									{{ course.in_progress_count || 0 }}
								</div>
							</div>
							<div class="rounded bg-surface-gray-1 p-2">
								<div class="text-xs text-ink-gray-5">{{ __('Not Started') }}</div>
								<div class="mt-1 text-sm font-semibold text-ink-gray-9">
									{{ course.not_started_count || 0 }}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section class="mt-5 rounded-md border bg-surface-white p-4">
				<h2 class="text-lg font-semibold text-ink-gray-9">
					{{ __('Course Insights') }}
				</h2>
				<p class="mt-1 text-sm text-ink-gray-6">
					{{ __('A quick view of learner engagement across your courses') }}
				</p>

				<div
					v-if="isInitialMetricsLoading"
					class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3"
				>
					<div
						v-for="index in 3"
						:key="index"
						class="space-y-3 rounded border border-outline-gray-1 p-3"
					>
						<div class="h-4 w-28 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-5 w-3/4 animate-pulse rounded bg-surface-gray-2"></div>
						<div class="h-4 w-20 animate-pulse rounded bg-surface-gray-2"></div>
					</div>
				</div>
				<div
					v-else-if="!courseCompletionBreakdown.length"
					class="mt-5 rounded border border-dashed border-outline-gray-2 p-3 text-sm text-ink-gray-5"
				>
					{{ __('No instructor courses yet') }}
				</div>
				<div v-else class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
					<div class="min-w-0 rounded border border-outline-gray-1 p-3">
						<div class="text-xs font-medium uppercase text-ink-gray-5">
							{{ __('Most Learners') }}
						</div>
						<div class="mt-2 break-words text-sm font-semibold text-ink-gray-9">
							{{ mostLearnersCourse?.course_title || __('Untitled Course') }}
						</div>
						<div class="mt-1 text-sm text-ink-gray-6">
							{{ mostLearnersCourse?.total_learners || 0 }} {{ __('learners') }}
						</div>
					</div>
					<div class="min-w-0 rounded border border-outline-gray-1 p-3">
						<div class="text-xs font-medium uppercase text-ink-gray-5">
							{{ __('Highest Completion') }}
						</div>
						<template v-if="highestCompletionCourse">
							<div class="mt-2 break-words text-sm font-semibold text-ink-gray-9">
								{{ highestCompletionCourse.course_title || __('Untitled Course') }}
							</div>
							<div class="mt-1 text-sm text-ink-gray-6">
								{{ getCompletionRate(highestCompletionCourse) }}%
							</div>
						</template>
						<div v-else class="mt-2 text-sm text-ink-gray-6">
							{{ __('No learner activity yet') }}
						</div>
					</div>
					<div class="min-w-0 rounded border border-outline-gray-1 p-3">
						<div class="text-xs font-medium uppercase text-ink-gray-5">
							{{ __('Lowest Completion Rate') }}
						</div>
						<template v-if="lowestCompletionCourse">
							<div class="mt-2 break-words text-sm font-semibold text-ink-gray-9">
								{{ lowestCompletionCourse.course_title || __('Untitled Course') }}
							</div>
							<div class="mt-1 text-sm text-ink-gray-6">
								{{ getCompletionRate(lowestCompletionCourse) }}%
							</div>
						</template>
						<div v-else class="mt-2 text-sm text-ink-gray-6">
							{{ __('No learner activity yet') }}
						</div>
					</div>
				</div>
			</section>
			</template>
		</div>
	</div>
</template>

<script setup>
import { createResource } from 'frappe-ui'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Award, BookOpen, Download, FileQuestion, RefreshCw, Upload, Users } from 'lucide-vue-next'
import { usersStore } from '@/stores/user'

const { userResource } = usersStore()
const router = useRouter()
const rolesLoading = ref(true)
const canViewDashboard = ref(false)
const lastMetricsUpdatedAt = ref(null)
const completionBreakdownSearch = ref('')
const completionBreakdownSort = ref('default')
const instructorMetrics = createResource({
	url: 'lms.lms.api.get_my_instructor_metrics',
	cache: ['instructor_dashboard_basic_metrics'],
	auto: false,
})

const cards = [
	{
		index: 1,
		key: 'my-courses',
		title: 'My Courses',
		label: 'assigned courses',
	},
	{
		index: 2,
		key: 'total-learners',
		title: 'Total Learners',
		label: 'active learners',
	},
	{
		index: 3,
		key: 'pending-evaluations',
		title: 'Pending Evaluations',
		label: 'Items waiting for review',
	},
	{
		index: 4,
		key: 'average-course-progress',
		title: 'Average Course Progress',
		label: 'across courses',
	},
	{
		index: 5,
		key: 'recent-submissions',
		title: 'Recent Submissions',
		label: 'latest learner work',
	},
	{
		index: 6,
		key: 'course-performance',
		title: 'Course Performance',
		label: 'course outcomes',
	},
]

const quickActions = [
	{
		label: 'Create Course',
		description: 'Start a new course',
		icon: BookOpen,
		to: { name: 'Courses', query: { newCourse: '1' } },
	},
	{
		label: 'Create Quiz',
		description: 'Open quiz builder',
		icon: FileQuestion,
		to: { name: 'Quizzes', query: { new: 'true' } },
	},
	{
		label: 'Upload Lesson',
		icon: Upload,
		disabled: true,
	},
	{
		label: 'Create Batch',
		description: 'Manage batch setup',
		icon: Users,
		to: { name: 'Batches' },
	},
	{
		label: 'Issue Certificate',
		icon: Award,
		disabled: true,
	},
]

const activeQuickActions = quickActions.filter((action) => !action.disabled)
const disabledQuickActions = quickActions.filter((action) => action.disabled)

onMounted(async () => {
	try {
		await userResource.promise
		if (!canAccessInstructorDashboard()) {
			router.replace({ name: 'Home' })
			return
		}

		canViewDashboard.value = true
		void refreshInstructorMetrics()
	} finally {
		rolesLoading.value = false
	}
})

const canAccessInstructorDashboard = () => {
	return userResource?.data?.is_instructor || userResource?.data?.is_moderator
}

const refreshInstructorMetrics = async () => {
	try {
		await instructorMetrics.reload()
		lastMetricsUpdatedAt.value = new Date()
	} catch {
		return null
	}
}

const isInitialMetricsLoading = computed(() => {
	return instructorMetrics.loading && !instructorMetrics.data && !instructorMetrics.error
})

const isInitialMetricsError = computed(() => {
	return Boolean(instructorMetrics.error && !instructorMetrics.data)
})

const hasRefreshError = computed(() => {
	return Boolean(instructorMetrics.error && instructorMetrics.data)
})

const lastUpdatedLabel = computed(() => {
	if (!lastMetricsUpdatedAt.value) {
		return __('Not yet loaded')
	}

	return lastMetricsUpdatedAt.value.toLocaleString([], {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	})
})

const recentSubmissions = computed(() => {
	return instructorMetrics.data?.recent_submissions || []
})

const coursePerformance = computed(() => {
	return instructorMetrics.data?.course_performance || []
})

const pendingEvaluations = computed(() => {
	return instructorMetrics.data?.pending_evaluations || []
})

const learnerGrowth = computed(() => {
	return instructorMetrics.data?.learner_growth || []
})

const instructorNotifications = computed(() => {
	return instructorMetrics.data?.instructor_notifications || []
})

const recentLearners = computed(() => {
	return instructorMetrics.data?.recent_learners || []
})

const instructorCalendar = computed(() => {
	return instructorMetrics.data?.instructor_calendar || []
})

const learnersNeedingAttention = computed(() => {
	return instructorMetrics.data?.learners_needing_attention || []
})

const courseCompletionBreakdown = computed(() => {
	return instructorMetrics.data?.course_completion_breakdown || []
})

const filteredCourseCompletionBreakdown = computed(() => {
	const searchText = completionBreakdownSearch.value.trim().toLowerCase()
	const courses = courseCompletionBreakdown.value
		.map((course, index) => ({ course, index }))
		.filter(({ course }) => {
			if (!searchText) {
				return true
			}

			const title = String(course.course_title || '').toLowerCase()
			const name = String(course.course_name || '').toLowerCase()
			return title.includes(searchText) || name.includes(searchText)
		})

	courses.sort((left, right) => {
		let comparison = 0

		if (completionBreakdownSort.value === 'most-learners') {
			comparison = Number(right.course.total_learners || 0) - Number(left.course.total_learners || 0)
		} else if (completionBreakdownSort.value === 'highest-completion') {
			comparison = getCompletionRate(right.course) - getCompletionRate(left.course)
		} else if (completionBreakdownSort.value === 'lowest-completion') {
			comparison = getCompletionRate(left.course) - getCompletionRate(right.course)
		} else if (completionBreakdownSort.value === 'course-title') {
			comparison = String(left.course.course_title || '').localeCompare(
				String(right.course.course_title || '')
			)
		}

		return comparison || left.index - right.index
	})

	return courses.map(({ course }) => course)
})

const mostLearnersCourse = computed(() => {
	return courseCompletionBreakdown.value.reduce((selected, course) => {
		if (!selected) {
			return course
		}

		return Number(course.total_learners) > Number(selected.total_learners) ? course : selected
	}, null)
})

const coursesWithLearners = computed(() => {
	return courseCompletionBreakdown.value.filter((course) => Number(course.total_learners) > 0)
})

const highestCompletionCourse = computed(() => {
	return coursesWithLearners.value.reduce((selected, course) => {
		if (!selected) {
			return course
		}

		return getCompletionRate(course) > getCompletionRate(selected) ? course : selected
	}, null)
})

const lowestCompletionCourse = computed(() => {
	return coursesWithLearners.value.reduce((selected, course) => {
		if (!selected) {
			return course
		}

		return getCompletionRate(course) < getCompletionRate(selected) ? course : selected
	}, null)
})

const exportCourseCompletionCsv = () => {
	if (!courseCompletionBreakdown.value.length) {
		return
	}

	const headers = [
		'Course Name',
		'Course Title',
		'Total Learners',
		'Completed',
		'In Progress',
		'Not Started',
		'Completion Rate (%)',
	]
	const rows = courseCompletionBreakdown.value.map((course) => [
		sanitizeCsvText(course.course_name),
		sanitizeCsvText(course.course_title),
		getSafeCount(course.total_learners),
		getSafeCount(course.completed_count),
		getSafeCount(course.in_progress_count),
		getSafeCount(course.not_started_count),
		getCompletionRate(course),
	])
	const csv = [headers, ...rows]
		.map((row) => row.map((value) => escapeCsvValue(value)).join(','))
		.join('\r\n')
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `course-completion-report-${getLocalDateForFileName()}.csv`
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

const exportLearnersNeedingAttentionCsv = () => {
	if (!learnersNeedingAttention.value.length) {
		return
	}

	const headers = ['Learner Name', 'Course Name', 'Progress (%)', 'Enrolled At']
	const rows = learnersNeedingAttention.value.map((learner) => [
		sanitizeCsvText(learner.learner_name),
		sanitizeCsvText(learner.course_name),
		getSafeCount(learner.progress),
		sanitizeCsvText(learner.enrolled_at),
	])
	const csv = [headers, ...rows]
		.map((row) => row.map((value) => escapeCsvValue(value)).join(','))
		.join('\r\n')
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `learners-needing-attention-${getLocalDateForFileName()}.csv`
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}

const sanitizeCsvText = (value) => {
	const text = value == null ? '' : String(value)
	return /^[=+\-@]/.test(text) ? `'${text}` : text
}

const getSafeCount = (value) => {
	const count = Number(value)
	return Number.isFinite(count) ? count : 0
}

const escapeCsvValue = (value) => {
	const text = value == null ? '' : String(value)
	return `"${text.replace(/"/g, '""')}"`
}

const getLocalDateForFileName = () => {
	const date = new Date()
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const hasLearnerGrowthActivity = computed(() => {
	return learnerGrowth.value.some((month) => Number(month.count) > 0)
})

const maxLearnerGrowthCount = computed(() => {
	return Math.max(...learnerGrowth.value.map((month) => Number(month.count) || 0), 0)
})

const getInstructorMetricValue = (field, suffix = '') => {
	if (isInitialMetricsLoading.value) {
		return '...'
	}

	if (isInitialMetricsError.value) {
		return '—'
	}

	return `${instructorMetrics.data?.[field] ?? 0}${suffix}`
}

const formatSubmissionTime = (submittedAt) => {
	if (!submittedAt) {
		return ''
	}

	const date = new Date(submittedAt)
	if (Number.isNaN(date.getTime())) {
		return submittedAt
	}

	return date.toLocaleString([], {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	})
}

const formatScheduleDate = (value) => {
	if (!value) {
		return ''
	}

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) {
		return value
	}

	return date.toLocaleDateString([], {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
}

const formatScheduleTime = (value) => {
	if (!value) {
		return ''
	}

	const [hour, minute] = String(value).split(':')
	const date = new Date()
	date.setHours(Number(hour) || 0, Number(minute) || 0, 0, 0)
	return date.toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit',
	})
}

const formatScheduleTimeRange = (startTime, endTime) => {
	const start = formatScheduleTime(startTime)
	const end = formatScheduleTime(endTime)
	if (start && end) {
		return `${start} - ${end}`
	}

	return start || end
}

const getProgressWidth = (value) => {
	return Math.min(Math.max(Number(value) || 0, 0), 100)
}

const getCompletionRate = (course) => {
	const total = Number(course?.total_learners) || 0
	if (total <= 0) {
		return 0
	}

	const completed = Number(course?.completed_count) || 0
	return Math.min(Math.max(Math.round((completed / total) * 100), 0), 100)
}

const getLearnerGrowthHeight = (value) => {
	const count = Number(value) || 0
	if (!count || !maxLearnerGrowthCount.value) {
		return 0
	}

	return Math.max((count / maxLearnerGrowthCount.value) * 100, 8)
}
</script>
