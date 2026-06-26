# Copyright (c) 2021, FOSS United and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.desk.doctype.notification_log.notification_log import make_notification_logs
from frappe.model.document import Document
from frappe.utils import cint

PRIVILEGED_ROLES = {"System Manager"}


class LMSQuizSubmission(Document):
	def validate(self):
		self.enforce_member_ownership()
		self.validate_if_max_attempts_exceeded()
		self.validate_marks()
		self.set_percentage()

	def on_update(self):
		self.notify_member()

	def enforce_member_ownership(self):
		is_privileged = bool(PRIVILEGED_ROLES & set(frappe.get_roles()))
		if frappe.session.user == "Guest" and not is_privileged:
			frappe.throw(_("You can only submit quizzes for your own account."), frappe.PermissionError)

		if self.is_new():
			if not is_privileged and self.member != frappe.session.user:
				frappe.throw(_("You can only submit quizzes for your own account."), frappe.PermissionError)
			return

		stored_member = frappe.db.get_value(self.doctype, self.name, "member")
		if stored_member != self.member:
			frappe.throw(_("Quiz submission member cannot be changed."), frappe.PermissionError)

		if not is_privileged and stored_member != frappe.session.user:
			frappe.throw(_("You can only update your own quiz submissions."), frappe.PermissionError)

	def validate_if_max_attempts_exceeded(self):
		max_attempts = frappe.db.get_value("LMS Quiz", self.quiz, ["max_attempts"])
		if max_attempts == 0:
			return

		current_user_submission_count = frappe.db.count(
			self.doctype, filters={"quiz": self.quiz, "member": self.member}
		)
		if current_user_submission_count >= max_attempts:
			frappe.throw(
				_("You have exceeded the maximum number of attempts ({0}) for this quiz").format(
					max_attempts
				),
				MaximumAttemptsExceededError,
			)

	def validate_marks(self):
		self.score = 0
		for row in self.result:
			if cint(row.marks) > cint(row.marks_out_of):
				frappe.throw(
					_(
						"Marks for question number {0} cannot be greater than the marks allotted for that question."
					).format(row.idx)
				)
			else:
				self.score += cint(row.marks)

	def set_percentage(self):
		if self.score and self.score_out_of:
			self.percentage = (self.score / self.score_out_of) * 100

	def notify_member(self):
		if self.score != 0 and self.has_value_changed("score"):
			notification = frappe._dict(
				{
					"subject": _("You have got a score of {0} for the quiz {1}").format(
						(frappe.bold(self.score)), frappe.bold(self.quiz_title)
					),
					"email_content": _(
						"There has been an update on your submission. You have got a score of {0} for the quiz {1}"
					).format(frappe.bold(self.score), frappe.bold(self.quiz_title)),
					"document_type": self.doctype,
					"document_name": self.name,
					"for_user": self.member,
					"from_user": frappe.session.user,
					"type": "Alert",
					"link": "",
				}
			)

			make_notification_logs(notification, [self.member])


class MaximumAttemptsExceededError(frappe.DuplicateEntryError):
	pass
