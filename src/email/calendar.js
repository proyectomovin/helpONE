/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    2025-11-27
 *  Copyright (c) 2014-2025. All rights reserved.
 */

/**
 * Calendar Integration Module
 * Creates iCalendar (ICS) attachments for email notifications
 * Compatible with Google Calendar, Outlook, Apple Calendar, etc.
 */

var moment = require('moment')
var crypto = require('crypto')

/**
 * Format date for iCalendar format (YYYYMMDD'T'HHMMSS'Z')
 */
function formatICalDate(date) {
  if (!date) return null
  return moment(date).utc().format('YYYYMMDDTHHmmss') + 'Z'
}

/**
 * Escape special characters in iCalendar text
 */
function escapeICalText(text) {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Generate unique UID for calendar event
 */
function generateUID() {
  return crypto.randomBytes(16).toString('hex') + '@helpdesk'
}

/**
 * Fold long lines according to iCalendar spec (max 75 chars)
 */
function foldLine(line) {
  if (line.length <= 75) return line

  var result = ''
  var remaining = line

  while (remaining.length > 75) {
    result += remaining.substring(0, 75) + '\r\n '
    remaining = remaining.substring(75)
  }

  result += remaining
  return result
}

/**
 * Create SLA Warning Calendar Event
 * @param {Object} ticket - Ticket object
 * @param {Date} slaDeadline - SLA deadline date
 * @param {Object} options - Additional options
 * @returns {String} iCalendar content
 */
function createSLAWarningEvent(ticket, slaDeadline, options) {
  options = options || {}

  const uid = options.uid || generateUID()
  const now = formatICalDate(new Date())
  const startDate = formatICalDate(slaDeadline)

  // Set reminder 1 hour before
  const reminderMinutes = options.reminderMinutes || 60

  // Calculate alarm time (minutes before event)
  const alarmTrigger = `-PT${reminderMinutes}M`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HelpONE//Email Notifications//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${startDate}`,
    foldLine(`SUMMARY:SLA Deadline - Ticket #${ticket.uid}: ${escapeICalText(ticket.subject)}`),
    foldLine(`DESCRIPTION:Ticket #${ticket.uid} SLA deadline approaching\\n\\n` +
      `Subject: ${escapeICalText(ticket.subject)}\\n` +
      `Priority: ${ticket.priority ? ticket.priority.name : 'Normal'}\\n` +
      `Status: ${ticket.status ? ticket.status.name : ticket.status}\\n\\n` +
      `Please resolve this ticket before the SLA deadline.\\n\\n` +
      `View ticket: ${options.ticketUrl || ''}`),
    `LOCATION:${options.location || 'HelpDesk System'}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'PRIORITY:1',
    'CLASS:PUBLIC',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:' + alarmTrigger,
    'ACTION:DISPLAY',
    `DESCRIPTION:SLA deadline for Ticket #${ticket.uid} in ${reminderMinutes} minutes`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

/**
 * Create Ticket Assignment Calendar Event
 * @param {Object} ticket - Ticket object
 * @param {Object} assignee - Assignee user object
 * @param {Object} options - Additional options
 * @returns {String} iCalendar content
 */
function createTicketAssignmentEvent(ticket, assignee, options) {
  options = options || {}

  const uid = options.uid || generateUID()
  const now = formatICalDate(new Date())
  const startDate = formatICalDate(new Date())

  // Set end date to estimated completion (default: 2 hours from now)
  const endDate = options.endDate || moment().add(2, 'hours').toDate()
  const formattedEndDate = formatICalDate(endDate)

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HelpONE//Email Notifications//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${formattedEndDate}`,
    foldLine(`SUMMARY:Ticket Assigned - #${ticket.uid}: ${escapeICalText(ticket.subject)}`),
    foldLine(`DESCRIPTION:New ticket assigned to you\\n\\n` +
      `Ticket #${ticket.uid}\\n` +
      `Subject: ${escapeICalText(ticket.subject)}\\n` +
      `Priority: ${ticket.priority ? ticket.priority.name : 'Normal'}\\n` +
      `Submitted by: ${ticket.owner ? ticket.owner.fullname : 'Unknown'}\\n\\n` +
      `${escapeICalText(ticket.issue || '')}\\n\\n` +
      `View ticket: ${options.ticketUrl || ''}`),
    foldLine(`ATTENDEE;CN="${escapeICalText(assignee.fullname)}";RSVP=FALSE:mailto:${assignee.email}`),
    foldLine(`ORGANIZER;CN="HelpDesk System":mailto:${options.organizerEmail || 'noreply@helpdesk.com'}`),
    `LOCATION:${options.location || 'HelpDesk System'}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'PRIORITY:' + (ticket.priority && ticket.priority.name === 'Critical' ? '1' : '5'),
    'CLASS:PUBLIC',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

/**
 * Create Meeting/Follow-up Calendar Event
 * @param {Object} ticket - Ticket object
 * @param {Date} meetingDate - Meeting date
 * @param {Number} duration - Duration in minutes
 * @param {Array} attendees - Array of attendee objects
 * @param {Object} options - Additional options
 * @returns {String} iCalendar content
 */
function createMeetingEvent(ticket, meetingDate, duration, attendees, options) {
  options = options || {}

  const uid = options.uid || generateUID()
  const now = formatICalDate(new Date())
  const startDate = formatICalDate(meetingDate)
  const endDate = formatICalDate(moment(meetingDate).add(duration || 30, 'minutes').toDate())

  // Build attendees list
  const attendeesList = (attendees || []).map(function (attendee) {
    return foldLine(`ATTENDEE;CN="${escapeICalText(attendee.fullname)}";RSVP=TRUE:mailto:${attendee.email}`)
  }).join('\r\n')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HelpONE//Email Notifications//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    foldLine(`SUMMARY:${options.title || 'Follow-up'} - Ticket #${ticket.uid}`),
    foldLine(`DESCRIPTION:${escapeICalText(options.description || '')}\\n\\n` +
      `Ticket #${ticket.uid}\\n` +
      `Subject: ${escapeICalText(ticket.subject)}\\n\\n` +
      `View ticket: ${options.ticketUrl || ''}`),
    attendeesList,
    foldLine(`ORGANIZER;CN="${escapeICalText(options.organizerName || 'HelpDesk System')}":mailto:${options.organizerEmail || 'noreply@helpdesk.com'}`),
    `LOCATION:${escapeICalText(options.location || 'To be determined')}`,
    'STATUS:TENTATIVE',
    'SEQUENCE:0',
    'PRIORITY:5',
    'CLASS:PUBLIC',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Meeting reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

/**
 * Create calendar attachment for email
 * @param {String} icsContent - iCalendar content
 * @param {String} filename - Filename for attachment (default: event.ics)
 * @returns {Object} Nodemailer attachment object
 */
function createCalendarAttachment(icsContent, filename) {
  return {
    filename: filename || 'event.ics',
    content: icsContent,
    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
    encoding: '7bit'
  }
}

/**
 * Create alternate calendar attachment (for better compatibility)
 * @param {String} icsContent - iCalendar content
 * @returns {Object} Nodemailer attachment object
 */
function createAlternateCalendarAttachment(icsContent) {
  return {
    contentType: 'application/ics',
    content: Buffer.from(icsContent),
    encoding: 'base64',
    headers: {
      'Content-Class': 'urn:content-classes:calendarmessage',
      'Content-Disposition': 'inline; filename="event.ics"'
    }
  }
}

module.exports = {
  createSLAWarningEvent: createSLAWarningEvent,
  createTicketAssignmentEvent: createTicketAssignmentEvent,
  createMeetingEvent: createMeetingEvent,
  createCalendarAttachment: createCalendarAttachment,
  createAlternateCalendarAttachment: createAlternateCalendarAttachment,
  generateUID: generateUID,
  formatICalDate: formatICalDate,
  escapeICalText: escapeICalText
}
