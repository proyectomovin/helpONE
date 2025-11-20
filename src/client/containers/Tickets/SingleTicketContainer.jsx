/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Updated:    6/21/19 9:32 AM
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React, { Fragment, createRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observable, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import sortBy from 'lodash/sortBy'
import union from 'lodash/union'

import { transferToThirdParty, fetchTicketTypes, fetchTicketStatus } from 'actions/tickets'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { showModal } from 'actions/common'
import { t } from 'helpers/i18n'

import {
  TICKETS_UPDATE,
  TICKETS_UI_GROUP_UPDATE,
  TICKETS_GROUP_SET,
  TICKETS_UI_TYPE_UPDATE,
  TICKETS_TYPE_SET,
  TICKETS_UI_PRIORITY_UPDATE,
  TICKETS_PRIORITY_SET,
  TICKETS_UI_PRODUCT_UPDATE,
  TICKETS_PRODUCT_SET,
  TICKETS_UI_MODULE_UPDATE,
  TICKETS_MODULE_SET,
  TICKETS_UI_REQUESTER_UPDATE,
  TICKETS_REQUESTER_SET,
  TICKETS_ASSIGNEE_LOAD,
  TICKETS_ASSIGNEE_UPDATE,
  TICKETS_UI_DUEDATE_UPDATE,
  TICKETS_DUEDATE_SET,
  TICKETS_UI_TAGS_UPDATE,
  TICKETS_COMMENT_NOTE_REMOVE,
  TICKETS_COMMENT_NOTE_SET,
  TICKETS_UI_TIMETRACKING_UPDATE,
  TICKETS_ESTIMATEDHOURS_SET,
  TICKETS_TIMEENTRY_ADD,
  TICKETS_TIMEENTRY_DELETE
} from 'serverSocket/socketEventConsts'

import AssigneeDropdownPartial from 'containers/Tickets/AssigneeDropdownPartial'
import Avatar from 'components/Avatar/Avatar'
import CommentNotePartial from 'containers/Tickets/CommentNotePartial'
import DatePicker from 'components/DatePicker'
import EasyMDE from 'components/EasyMDE'
import IssuePartial from 'containers/Tickets/IssuePartial'
import OffCanvasEditor from 'components/OffCanvasEditor'
import PDropdownTrigger from 'components/PDropdown/PDropdownTrigger'
import StatusSelector from 'containers/Tickets/StatusSelector'
import TimeTrackingPartial from 'containers/Tickets/TimeTrackingPartial'
import TruTabSection from 'components/TruTabs/TruTabSection'
import TruTabSelector from 'components/TruTabs/TruTabSelector'
import TruTabSelectors from 'components/TruTabs/TruTabSelectors'
import TruTabWrapper from 'components/TruTabs/TruTabWrapper'

import axios from 'axios'
import helpers from 'lib/helpers'
import Log from '../../logger'
import UIkit from 'uikit'
import moment from 'moment'
import SpinLoader from 'components/SpinLoader'

const fetchTicket = parent => {
  axios
    .get(`/api/v2/tickets/${parent.props.ticketUid}`)
    .then(res => {
      // setTimeout(() => {
      parent.ticket = res.data.ticket
      parent.isSubscribed =
        parent.ticket && parent.ticket.subscribers.findIndex(i => i._id === parent.props.shared.sessionUser._id) !== -1
      // Load group members for the ticket's group
      if (parent.ticket && parent.ticket.group && parent.ticket.group._id) {
        parent.loadGroupMembers(parent.ticket.group._id)
      }
      // }, 3000)
    })
    .catch(error => {
      if (error.response.status === 403) {
        History.pushState(null, null, '/tickets')
      }
      Log.error(error)
    })
}

const showPriorityConfirm = () => {
  UIkit.modal.confirm(
    t('tickets.priorityNotExist'),
    () => {},
    { cancelButtonClass: 'uk-hidden' }
  )
}

@observer
class SingleTicketContainer extends React.Component {
  @observable ticket = null
  @observable isSubscribed = false
  @observable products = []
  @observable modules = []
  @observable filteredModules = []
  @observable groupMembers = []
  assigneeDropdownPartial = createRef()

  constructor (props) {
    super(props)
    makeObservable(this)

    this.onUpdateTicket = this.onUpdateTicket.bind(this)
    this.onSocketUpdateComments = this.onSocketUpdateComments.bind(this)
    this.onUpdateTicketNotes = this.onUpdateTicketNotes.bind(this)
    this.onUpdateAssignee = this.onUpdateAssignee.bind(this)
    this.onUpdateTicketType = this.onUpdateTicketType.bind(this)
    this.onUpdateTicketPriority = this.onUpdateTicketPriority.bind(this)
    this.onUpdateTicketGroup = this.onUpdateTicketGroup.bind(this)
    this.onUpdateTicketDueDate = this.onUpdateTicketDueDate.bind(this)
    this.onUpdateTicketTags = this.onUpdateTicketTags.bind(this)
    this.onUpdateTicketProduct = this.onUpdateTicketProduct.bind(this)
    this.onUpdateTicketModule = this.onUpdateTicketModule.bind(this)
    this.onUpdateTicketRequester = this.onUpdateTicketRequester.bind(this)
  }

  @computed
  get notesTagged () {
    this.ticket.notes.forEach(i => (i.isNote = true))

    return this.ticket.notes
  }

  @computed get commentsAndNotes () {
    if (!this.ticket) return []
    if (!helpers.canUser('tickets:notes', true)) {
      return sortBy(this.ticket.comments, 'date')
    }

    let commentsAndNotes = union(this.ticket.comments, this.notesTagged)
    commentsAndNotes = sortBy(commentsAndNotes, 'date')

    return commentsAndNotes
  }

  @computed get hasCommentsOrNotes () {
    if (!this.ticket) return false
    return this.ticket.comments.length > 0 || this.ticket.notes.length > 0
  }

  componentDidMount () {
    this.props.socket.on(TICKETS_UPDATE, this.onUpdateTicket)
    this.props.socket.on(TICKETS_ASSIGNEE_UPDATE, this.onUpdateAssignee)
    this.props.socket.on(TICKETS_UI_TYPE_UPDATE, this.onUpdateTicketType)
    this.props.socket.on(TICKETS_UI_PRIORITY_UPDATE, this.onUpdateTicketPriority)
    this.props.socket.on(TICKETS_UI_GROUP_UPDATE, this.onUpdateTicketGroup)
    this.props.socket.on(TICKETS_UI_DUEDATE_UPDATE, this.onUpdateTicketDueDate)
    this.props.socket.on(TICKETS_UI_TAGS_UPDATE, this.onUpdateTicketTags)
    this.props.socket.on(TICKETS_UI_PRODUCT_UPDATE, this.onUpdateTicketProduct)
    this.props.socket.on(TICKETS_UI_MODULE_UPDATE, this.onUpdateTicketModule)
    this.props.socket.on(TICKETS_UI_REQUESTER_UPDATE, this.onUpdateTicketRequester)
    this.props.socket.on(TICKETS_UI_TIMETRACKING_UPDATE, this.onUpdateTimeTracking)

    fetchTicket(this)
    this.props.fetchTicketTypes()
    this.props.fetchGroups()
    this.props.fetchTicketStatus()
    this.loadProducts()
    this.loadModules()
  }

  componentDidUpdate () {
    helpers.resizeFullHeight()
    helpers.setupScrollers()
  }

  componentWillUnmount () {
    this.props.socket.off(TICKETS_UPDATE, this.onUpdateTicket)
    this.props.socket.off(TICKETS_ASSIGNEE_UPDATE, this.onUpdateAssignee)
    this.props.socket.off(TICKETS_UI_TYPE_UPDATE, this.onUpdateTicketType)
    this.props.socket.off(TICKETS_UI_PRIORITY_UPDATE, this.onUpdateTicketPriority)
    this.props.socket.off(TICKETS_UI_GROUP_UPDATE, this.onUpdateTicketGroup)
    this.props.socket.off(TICKETS_UI_DUEDATE_UPDATE, this.onUpdateTicketDueDate)
    this.props.socket.off(TICKETS_UI_TAGS_UPDATE, this.onUpdateTicketTags)
    this.props.socket.off(TICKETS_UI_PRODUCT_UPDATE, this.onUpdateTicketProduct)
    this.props.socket.off(TICKETS_UI_MODULE_UPDATE, this.onUpdateTicketModule)
    this.props.socket.off(TICKETS_UI_REQUESTER_UPDATE, this.onUpdateTicketRequester)
    this.props.socket.off(TICKETS_UI_TIMETRACKING_UPDATE, this.onUpdateTimeTracking)

    this.props.unloadGroups()
  }

  onUpdateTicket (data) {
    if (this.ticket._id === data._id) {
      this.ticket = data
    }
  }

  onSocketUpdateComments (data) {
    if (this.ticket._id === data._id) this.ticket.comments = data.comments
  }

  onUpdateTicketNotes (data) {
    if (this.ticket._id === data._id) this.ticket.notes = data.notes
  }

  onUpdateAssignee (data) {
    if (this.ticket._id === data._id) {
      this.ticket.assignee = data.assignee
      if (this.ticket.assignee && this.ticket.assignee._id === this.props.shared.sessionUser._id)
        this.isSubscribed = true
    }
  }

  onUpdateTicketType (data) {
    if (this.ticket._id === data._id) this.ticket.type = data.type
  }

  onUpdateTicketPriority (data) {
    if (this.ticket._id === data._id) this.ticket.priority = data.priority
  }

  onUpdateTicketGroup (data) {
    if (this.ticket._id === data._id) {
      this.ticket.group = data.group
      // Reload group members when group changes
      if (data.group && data.group._id) {
        this.loadGroupMembers(data.group._id)
      } else {
        this.groupMembers = []
      }
    }
  }

  onUpdateTicketDueDate (data) {
    if (this.ticket._id === data._id) this.ticket.dueDate = data.dueDate
  }

  onUpdateTicketTags (data) {
    if (this.ticket._id === data._id) this.ticket.tags = data.tags
  }

  onUpdateTicketProduct (data) {
    if (this.ticket._id === data._id) {
      this.ticket.product = data.product
      // When product changes, filter modules and reset module if not compatible
      this.filterModulesByProduct(data.product ? data.product._id : null)
      if (this.ticket.module) {
        const moduleExists = this.filteredModules.find(m => m._id === this.ticket.module._id)
        if (!moduleExists) {
          this.ticket.module = null
        }
      }
    }
  }

  onUpdateTicketModule (data) {
    if (this.ticket._id === data._id) this.ticket.module = data.module
  }

  onUpdateTicketRequester (data) {
    if (this.ticket._id === data._id) this.ticket.requester = data.requester
  }

  loadProducts () {
    axios
      .get('/api/v1/products/enabled')
      .then(res => {
        if (res.data.success && res.data.products) {
          this.products = res.data.products
        }
      })
      .catch(err => {
        Log.error('Error loading products:', err)
      })
  }

  loadModules () {
    axios
      .get('/api/v1/modules/enabled')
      .then(res => {
        if (res.data.success && res.data.modules) {
          this.modules = res.data.modules
          // Initialize filtered modules based on current ticket product
          if (this.ticket && this.ticket.product) {
            this.filterModulesByProduct(this.ticket.product._id)
          } else {
            this.filteredModules = this.modules
          }
        }
      })
      .catch(err => {
        Log.error('Error loading modules:', err)
      })
  }

  filterModulesByProduct (productId) {
    if (!productId) {
      // No product selected: show independent modules only
      this.filteredModules = this.modules.filter(m => !m.product)
    } else {
      // Product selected: show modules of this product + independent modules
      this.filteredModules = this.modules.filter(m => !m.product || (m.product._id || m.product) === productId)
    }
  }

  loadGroupMembers (groupId) {
    if (!groupId) {
      this.groupMembers = []
      return
    }

    axios
      .get(`/api/v1/groups/${groupId}`)
      .then(res => {
        if (res.data && res.data.group && res.data.group.members) {
          this.groupMembers = res.data.group.members
        }
      })
      .catch(err => {
        Log.error('Error loading group members:', err)
        this.groupMembers = []
      })
  }

  onCommentNoteSubmit (e, type) {
    e.preventDefault()
    const isNote = type === 'note'
    axios
      .post(`/api/v1/tickets/add${isNote ? 'note' : 'comment'}`, {
        _id: !isNote && this.ticket._id,
        comment: !isNote && this.commentMDE.getEditorText(),

        ticketid: isNote && this.ticket._id,
        note: isNote && this.noteMDE.getEditorText()
      })
      .then(res => {
        if (res && res.data && res.data.success) {
          if (isNote) {
            this.ticket.notes = res.data.ticket.notes
            this.noteMDE.setEditorText('')
          } else {
            this.ticket.comments = res.data.ticket.comments
            this.commentMDE.setEditorText('')
          }

          helpers.scrollToBottom('.page-content-right', true)
          this.ticket.history = res.data.ticket.history
        }
      })
      .catch(error => {
        Log.error(error)
        if (error.response) Log.error(error.response)
        helpers.UI.showSnackbar(error, true)
      })
  }

  onSubscriberChanged (e) {
    axios
      .put(`/api/v1/tickets/${this.ticket._id}/subscribe`, {
        user: this.props.shared.sessionUser._id,
        subscribe: e.target.checked
      })
      .then(res => {
        if (res.data.success && res.data.ticket) {
          this.ticket.subscribers = res.data.ticket.subscribers
          this.isSubscribed = this.ticket.subscribers.findIndex(i => i._id === this.props.shared.sessionUser._id) !== -1
        }
      })
      .catch(error => {
        Log.error(error.response || error)
      })
  }

  handleUpdateEstimatedHours = hours => {
    this.props.socket.emit(TICKETS_ESTIMATEDHOURS_SET, {
      _id: this.ticket._id,
      hours: hours
    })
  }

  handleAddTimeEntry = (hours, description) => {
    this.props.socket.emit(TICKETS_TIMEENTRY_ADD, {
      _id: this.ticket._id,
      hours: hours,
      description: description
    })
  }

  handleEditTimeEntry = timeEntryId => {
    helpers.UI.showSnackbar('Edit time entry functionality coming soon')
    // TODO: Implement edit modal
  }

  handleRemoveTimeEntry = timeEntryId => {
    UIkit.modal.confirm('Are you sure you want to delete this time entry?', () => {
      this.props.socket.emit(TICKETS_TIMEENTRY_DELETE, {
        _id: this.ticket._id,
        timeEntryId: timeEntryId
      })
    })
  }

  onUpdateTimeTracking = (data) => {
    if (this.ticket._id === data.tid) {
      this.ticket.estimatedHours = data.estimatedHours
      this.ticket.timeEntries = data.timeEntries
      this.ticket.history = data.history
    }
  }

  transferToThirdParty (e) {
    this.props.transferToThirdParty({ uid: this.ticket.uid })
  }

  render () {
    const mappedGroups = this.props.groupsState
      ? this.props.groupsState.groups.map(group => {
          return { text: group.get('name'), value: group.get('_id') }
        })
      : []

    const mappedTypes = this.props.ticketTypes
      ? this.props.ticketTypes.map(type => {
          return { text: type.get('name'), value: type.get('_id'), raw: type.toJS() }
        })
      : []

    // Perms
    const hasTicketUpdate = this.ticket && this.ticket.status.isResolved === false && helpers.canUser('tickets:update')
    const statusObj = this.ticket ? this.props.ticketStatuses.find(s => s.get('_id') === this.ticket.status._id) : null

    const hasTicketStatusUpdate = () => {
      const isAgent = this.props.sessionUser ? this.props.sessionUser.role.isAgent : false
      const isAdmin = this.props.sessionUser ? this.props.sessionUser.role.isAdmin : false
      if (isAgent || isAdmin) {
        return helpers.canUser('tickets:update')
      } else {
        if (!this.ticket || !this.props.sessionUser) return false
        return helpers.hasPermOverRole(this.ticket.owner.role, this.props.sessionUser.role, 'tickets:update', false)
      }
    }

    return (
      <div className={'uk-clearfix uk-position-relative'} style={{ width: '100%', height: '100vh' }}>
        {!this.ticket && <SpinLoader active={true} />}
        {this.ticket && (
          <Fragment>
            <div className={'page-content'}>
              <div
                className='uk-float-left page-title page-title-small noshadow nopadding relative'
                style={{ width: 360, maxWidth: 360, minWidth: 360 }}
              >
                <div className='page-title-border-right relative' style={{ padding: '0 30px' }}>
                  <p>{t('tickets.ticketNumber', { number: this.ticket.uid })}</p>
                  <StatusSelector
                    ticketId={this.ticket._id}
                    status={this.ticket.status._id}
                    socket={this.props.socket}
                    onStatusChange={status => {
                      this.ticket.status = status
                    }}
                    hasPerm={hasTicketStatusUpdate()}
                  />
                </div>
                {/*  Left Side */}
                <div className='page-content-left full-height scrollable'>
                  <div className='ticket-details-wrap uk-position-relative uk-clearfix'>
                    <div className='ticket-assignee-wrap uk-clearfix' style={{ paddingRight: 30 }}>
                      <h4>{t('tickets.assignee')}</h4>
                      <div className='ticket-assignee uk-clearfix'>
                        {hasTicketUpdate && (
                          <a
                            role='button'
                            title={t('tickets.setAssignee')}
                            style={{ float: 'left' }}
                            className='relative no-ajaxy'
                            onClick={() => this.props.socket.emit(TICKETS_ASSIGNEE_LOAD)}
                          >
                            <PDropdownTrigger target={this.assigneeDropdownPartial}>
                              <Avatar
                                image={this.ticket.assignee && this.ticket.assignee.image}
                                showOnlineBubble={this.ticket.assignee !== undefined}
                                userId={this.ticket.assignee && this.ticket.assignee._id}
                              />
                              <span className='drop-icon material-icons'>keyboard_arrow_down</span>
                            </PDropdownTrigger>
                          </a>
                        )}
                        {!hasTicketUpdate && (
                          <Avatar
                            image={this.ticket.assignee && this.ticket.assignee.image}
                            showOnlineBubble={this.ticket.assignee !== undefined}
                            userId={this.ticket.assignee && this.ticket.assignee._id}
                          />
                        )}
                        <div className='ticket-assignee-details'>
                          {!this.ticket.assignee && <h3>{t('tickets.noUserAssigned')}</h3>}
                          {this.ticket.assignee && (
                            <Fragment>
                              <h3>{this.ticket.assignee.fullname}</h3>
                              <a
                                className='comment-email-link uk-text-truncate uk-display-inline-block'
                                href={`mailto:${this.ticket.assignee.email}`}
                              >
                                {this.ticket.assignee.email}
                              </a>
                              <span className={'uk-display-block'}>{this.ticket.assignee.title}</span>
                            </Fragment>
                          )}
                        </div>
                      </div>

                      {hasTicketUpdate && (
                        <AssigneeDropdownPartial
                          forwardedRef={this.assigneeDropdownPartial}
                          ticketId={this.ticket._id}
                          onClearClick={() => (this.ticket.assignee = undefined)}
                          onAssigneeClick={({ agent }) => (this.ticket.assignee = agent)}
                        />
                      )}
                    </div>

                    <div className='uk-width-1-1 padding-left-right-15'>
                      <div className='tru-card ticket-details uk-clearfix'>
                        {/* Type */}
                        <div className='uk-width-1-2 uk-float-left nopadding'>
                          <div className='marginright5'>
                            <span>{t('table.type')}</span>
                            {hasTicketUpdate && (
                              <select
                                value={this.ticket.type._id}
                                onChange={e => {
                                  const type = this.props.ticketTypes.find(t => t.get('_id') === e.target.value)

                                  const priority = type
                                    .get('priorities')
                                    .findIndex(p => p.get('_id') === this.ticket.priority._id)

                                  const hasPriority = priority !== -1

                                  if (!hasPriority) {
                                    this.props.socket.emit(TICKETS_PRIORITY_SET, {
                                      _id: this.ticket._id,
                                      value: type.get('priorities').find(() => true)
                                    })

                                    showPriorityConfirm()
                                  }

                                  this.props.socket.emit(TICKETS_TYPE_SET, {
                                    _id: this.ticket._id,
                                    value: e.target.value
                                  })
                                }}
                              >
                                {mappedTypes &&
                                  mappedTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.text}
                                    </option>
                                  ))}
                              </select>
                            )}
                            {!hasTicketUpdate && <div className='input-box'>{this.ticket.type.name}</div>}
                          </div>
                        </div>
                        {/* Priority */}
                        <div className='uk-width-1-2 uk-float-left nopadding'>
                          <div className='marginleft5'>
                            <span>{t('table.priority')}</span>
                            {hasTicketUpdate && (
                              <select
                                name='tPriority'
                                id='tPriority'
                                value={this.ticket.priority._id}
                                onChange={e =>
                                  this.props.socket.emit(TICKETS_PRIORITY_SET, {
                                    _id: this.ticket._id,
                                    value: e.target.value
                                  })
                                }
                              >
                                {this.ticket.type &&
                                  this.ticket.type.priorities &&
                                  this.ticket.type.priorities.map(priority => (
                                    <option key={priority._id} value={priority._id}>
                                      {priority.name}
                                    </option>
                                  ))}
                              </select>
                            )}
                            {!hasTicketUpdate && <div className={'input-box'}>{this.ticket.priority.name}</div>}
                          </div>
                        </div>
                        {/*  Group */}
                        <div className='uk-width-1-1 nopadding uk-clearfix'>
                          <span>{t('table.group')}</span>
                          {hasTicketUpdate && (
                            <select
                              value={this.ticket.group._id}
                              onChange={e => {
                                this.props.socket.emit(TICKETS_GROUP_SET, {
                                  _id: this.ticket._id,
                                  value: e.target.value
                                })
                              }}
                            >
                              {mappedGroups &&
                                mappedGroups.map(group => (
                                  <option key={group.value} value={group.value}>
                                    {group.text}
                                  </option>
                                ))}
                            </select>
                          )}
                          {!hasTicketUpdate && <div className={'input-box'}>{this.ticket.group.name}</div>}
                        </div>
                        {/*  Due Date */}
                        <div className='uk-width-1-1 p-0'>
                          <span>{t('table.dueDate')}</span> {hasTicketUpdate && <span>-&nbsp;</span>}
                          {hasTicketUpdate && (
                            <div className={'uk-display-inline'}>
                              <a
                                role={'button'}
                                onClick={e => {
                                  e.preventDefault()
                                  this.props.socket.emit(TICKETS_DUEDATE_SET, {
                                    _id: this.ticket._id,
                                    value: undefined
                                  })
                                }}
                              >
                                {t('actions.clear')}
                              </a>
                              <DatePicker
                                name={'ticket_due_date'}
                                format={helpers.getShortDateFormat()}
                                value={this.ticket.dueDate}
                                small={true}
                                onChange={e => {
                                  const dueDate = moment(e.target.value, helpers.getShortDateFormat())
                                    .utc()
                                    .toISOString()

                                  this.props.socket.emit(TICKETS_DUEDATE_SET, { _id: this.ticket._id, value: dueDate })
                                }}
                              />
                            </div>
                          )}
                          {!hasTicketUpdate && (
                            <div className='input-box'>
                              {helpers.formatDate(this.ticket.dueDate, this.props.common.get('shortDateFormat'))}
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div className='uk-width-1-1 nopadding'>
                          <span>
                            {t('tags.title')}
                            {hasTicketUpdate && (
                              <Fragment>
                                <span> - </span>
                                <div id='editTags' className={'uk-display-inline'}>
                                  <a
                                    role={'button'}
                                    style={{ fontSize: 11 }}
                                    className='no-ajaxy'
                                    onClick={() => {
                                      this.props.showModal('ADD_TAGS_MODAL', {
                                        ticketId: this.ticket._id,
                                        currentTags: this.ticket.tags.map(tag => tag._id)
                                      })
                                    }}
                                  >
                                    {t('tags.editTag')}
                                  </a>
                                </div>
                              </Fragment>
                            )}
                          </span>
                          <div className='tag-list uk-clearfix'>
                            {this.ticket.tags &&
                              this.ticket.tags.map(tag => (
                                <div key={tag._id} className='item'>
                                  {tag.name}
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Producto */}
                        <div className='uk-width-1-1 nopadding'>
                          <span>Producto</span>
                          {hasTicketUpdate && (
                            <select
                              value={this.ticket.product ? this.ticket.product._id : ''}
                              onChange={e => {
                                const productId = e.target.value || null
                                this.props.socket.emit(TICKETS_PRODUCT_SET, {
                                  _id: this.ticket._id,
                                  value: productId
                                })
                                // Filter modules based on selected product
                                this.filterModulesByProduct(productId)
                              }}
                            >
                              <option value=''>- Ninguno -</option>
                              {this.products &&
                                this.products.map(product => (
                                  <option key={product._id} value={product._id}>
                                    {product.name}
                                  </option>
                                ))}
                            </select>
                          )}
                          {!hasTicketUpdate && (
                            <div className='input-box'>{this.ticket.product ? this.ticket.product.name : '-'}</div>
                          )}
                        </div>

                        {/* Módulo */}
                        <div className='uk-width-1-1 nopadding'>
                          <span>Módulo</span>
                          {hasTicketUpdate && (
                            <select
                              value={this.ticket.module ? this.ticket.module._id : ''}
                              onChange={e => {
                                const moduleId = e.target.value || null
                                this.props.socket.emit(TICKETS_MODULE_SET, {
                                  _id: this.ticket._id,
                                  value: moduleId
                                })
                              }}
                            >
                              <option value=''>- Ninguno -</option>
                              {this.filteredModules &&
                                this.filteredModules.map(module => (
                                  <option key={module._id} value={module._id}>
                                    {module.product ? `${module.name} (${module.product.name})` : module.name}
                                  </option>
                                ))}
                            </select>
                          )}
                          {!hasTicketUpdate && (
                            <div className='input-box'>{this.ticket.module ? this.ticket.module.name : '-'}</div>
                          )}
                        </div>

                        {/* Solicitante */}
                        <div className='uk-width-1-1 nopadding'>
                          <span>Solicitante</span>
                          {hasTicketUpdate && (
                            <select
                              value={this.ticket.requester ? this.ticket.requester._id : ''}
                              onChange={e => {
                                const requesterId = e.target.value || null
                                this.props.socket.emit(TICKETS_REQUESTER_SET, {
                                  _id: this.ticket._id,
                                  value: requesterId
                                })
                              }}
                            >
                              <option value=''>- Ninguno -</option>
                              {this.groupMembers &&
                                this.groupMembers.map(member => (
                                  <option key={member._id} value={member._id}>
                                    {member.fullname}
                                  </option>
                                ))}
                            </select>
                          )}
                          {!hasTicketUpdate && (
                            <div className='input-box'>
                              {this.ticket.requester ? this.ticket.requester.fullname : '-'}
                            </div>
                          )}
                        </div>

                        {/* Billable */}
                        <div className='uk-width-1-1 nopadding'>
                          <span>Es Facturable</span>
                          <div className='input-box' style={{ cursor: 'pointer' }}>
                            <label style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center' }}>
                              <input
                                type='checkbox'
                                checked={this.ticket.billable}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                  this.ticket.billable = newValue
                                  this.props.socket.emit('$trudesk:tickets:billable:set', {
                                    _id: this.ticket._id,
                                    value: newValue
                                  })
                                }}
                                style={{ marginRight: 5 }}
                              />
                              {this.ticket.billable ? (
                                <span style={{ color: '#4CAF50' }}>Sí</span>
                              ) : (
                                <span style={{ color: '#9E9E9E' }}>No</span>
                              )}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {helpers.canUser('agent:*', true) && (
                      <div className='uk-width-1-1 padding-left-right-15'>
                        <div className='tru-card ticket-details pr-0 pb-0' style={{ height: 250 }}>
                          {t('tickets.history')}
                          <hr style={{ padding: 0, margin: 0 }} />
                          <div className='history-items scrollable' style={{ paddingTop: 12 }}>
                            {this.ticket.history &&
                              this.ticket.history.map(item => (
                                <div key={item._id} className='history-item'>
                                  <time
                                    dateTime={helpers.formatDate(item.date, this.props.common.get('longDateFormat'))}
                                  />
                                  <em>
                                    {t('tickets.actionBy')}: <span>{item.owner.fullname}</span>
                                  </em>
                                  <p>{item.description}</p>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Right Side */}
              <div className='page-message nopadding' style={{ marginLeft: 360 }}>
                <div className='page-title-right noshadow'>
                  {this.props.common.get('hasThirdParty') && (
                    <div className='page-top-comments uk-float-right'>
                      <a
                        role='button'
                        className='btn md-btn-primary no-ajaxy'
                        onClick={e => {
                          e.preventDefault()
                          this.transferToThirdParty(e)
                        }}
                      >
                        {t('tickets.transferToThirdParty')}
                      </a>
                    </div>
                  )}
                  <div className='page-top-comments uk-float-right'>
                    <a
                      role='button'
                      className='btn no-ajaxy'
                      onClick={e => {
                        e.preventDefault()
                        helpers.scrollToBottom('.page-content-right', true)
                      }}
                    >
                      {t('tickets.addComment')}
                    </a>
                  </div>
                  <div
                    className='onoffswitch subscribeSwitch uk-float-right'
                    style={{ marginRight: 10, position: 'relative', top: 18 }}
                  >
                    <input
                      id={'subscribeSwitch'}
                      type='checkbox'
                      name='subscribeSwitch'
                      className='onoffswitch-checkbox'
                      checked={this.isSubscribed}
                      onChange={e => this.onSubscriberChanged(e)}
                    />
                    <label className='onoffswitch-label' htmlFor='subscribeSwitch'>
                      <span className='onoffswitch-inner subscribeSwitch-inner' />
                      <span className='onoffswitch-switch subscribeSwitch-switch' />
                    </label>
                  </div>
                  <div className='pagination uk-float-right' style={{ marginRight: 5 }}>
                    <ul className='button-group'>
                      {helpers.canUser('tickets:print') && (
                        <li className='pagination'>
                          <a
                            href={`/tickets/print/${this.ticket.uid}`}
                            className='btn no-ajaxy'
                            style={{ borderRadius: 3, marginRight: 5 }}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            <i className='material-icons'>&#xE8AD;</i>
                          </a>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <div className='page-content-right full-height scrollable'>
                  <div className='comments-wrapper'>
                    <IssuePartial
                      ticketId={this.ticket._id}
                      status={statusObj}
                      owner={this.ticket.owner}
                      subject={this.ticket.subject}
                      issue={this.ticket.issue}
                      date={this.ticket.date}
                      dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get('timeFormat')}`}
                      attachments={this.ticket.attachments}
                      editorWindow={this.editorWindow}
                      socket={this.props.socket}
                    />

                    {/* Tabs */}
                    {this.hasCommentsOrNotes && (
                      <TruTabWrapper>
                        <TruTabSelectors style={{ marginLeft: 110 }}>
                          <TruTabSelector
                            selectorId={0}
                            label={t('common.all')}
                            active={true}
                            showBadge={true}
                            badgeText={this.commentsAndNotes.length}
                          />
                          <TruTabSelector
                            selectorId={1}
                            label={t('tickets.comments')}
                            showBadge={true}
                            badgeText={this.ticket ? this.ticket.comments && this.ticket.comments.length : 0}
                          />
                          {helpers.canUser('tickets:notes', true) && (
                            <TruTabSelector
                              selectorId={2}
                              label={t('tickets.notes')}
                              showBadge={true}
                              badgeText={this.ticket ? this.ticket.notes && this.ticket.notes.length : 0}
                            />
                          )}
                        </TruTabSelectors>

                        {/* Tab Sections */}
                        <TruTabSection sectionId={0} active={true}>
                          <div className='all-comments'>
                            {this.commentsAndNotes.map(item => (
                              <CommentNotePartial
                                key={item._id}
                                ticketStatus={statusObj}
                                ticketSubject={this.ticket.subject}
                                comment={item}
                                isNote={item.isNote}
                                dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get(
                                  'timeFormat'
                                )}`}
                                onEditClick={() => {
                                  this.editorWindow.openEditorWindow({
                                    showSubject: false,
                                    text: !item.isNote ? item.comment : item.note,
                                    onPrimaryClick: data => {
                                      this.props.socket.emit(TICKETS_COMMENT_NOTE_SET, {
                                        _id: this.ticket._id,
                                        item: item._id,
                                        isNote: item.isNote,
                                        value: data.text
                                      })
                                    }
                                  })
                                }}
                                onRemoveClick={() => {
                                  this.props.socket.emit(TICKETS_COMMENT_NOTE_REMOVE, {
                                    _id: this.ticket._id,
                                    value: item._id,
                                    isNote: item.isNote
                                  })
                                }}
                              />
                            ))}
                          </div>
                        </TruTabSection>
                        <TruTabSection sectionId={1}>
                          <div className='comments'>
                            {this.ticket &&
                              this.ticket.comments.map(comment => (
                                <CommentNotePartial
                                  key={comment._id}
                                  ticketStatus={statusObj}
                                  ticketSubject={this.ticket.subject}
                                  comment={comment}
                                  dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get(
                                    'timeFormat'
                                  )}`}
                                  onEditClick={() => {
                                    this.editorWindow.openEditorWindow({
                                      showSubject: false,
                                      text: comment.comment,
                                      onPrimaryClick: data => {
                                        this.props.socket.emit(TICKETS_COMMENT_NOTE_SET, {
                                          _id: this.ticket._id,
                                          item: comment._id,
                                          isNote: comment.isNote,
                                          value: data.text
                                        })
                                      }
                                    })
                                  }}
                                  onRemoveClick={() => {
                                    this.props.socket.emit(TICKETS_COMMENT_NOTE_REMOVE, {
                                      _id: this.ticket._id,
                                      value: comment._id,
                                      isNote: comment.isNote
                                    })
                                  }}
                                />
                              ))}
                          </div>
                        </TruTabSection>
                        <TruTabSection sectionId={2}>
                          <div className='notes'>
                            {this.ticket &&
                              this.ticket.notes.map(note => (
                                <CommentNotePartial
                                  key={note._id}
                                  ticketStatus={statusObj}
                                  ticketSubject={this.ticket.subject}
                                  comment={note}
                                  isNote={true}
                                  dateFormat={`${this.props.common.get('longDateFormat')}, ${this.props.common.get(
                                    'timeFormat'
                                  )}`}
                                  onEditClick={() => {
                                    this.editorWindow.openEditorWindow({
                                      showSubject: false,
                                      text: note.note,
                                      onPrimaryClick: data => {
                                        this.props.socket.emit(TICKETS_COMMENT_NOTE_SET, {
                                          _id: this.ticket._id,
                                          item: note._id,
                                          isNote: note.isNote,
                                          value: data.text
                                        })
                                      }
                                    })
                                  }}
                                  onRemoveClick={() => {
                                    this.props.socket.emit(TICKETS_COMMENT_NOTE_REMOVE, {
                                      _id: this.ticket._id,
                                      value: note._id,
                                      isNote: note.isNote
                                    })
                                  }}
                                />
                              ))}
                          </div>
                        </TruTabSection>
                      </TruTabWrapper>
                    )}

                    {/* Comment / Notes Form */}
                    {this.ticket.status.isResolved === false &&
                      (helpers.canUser('comments:create', true) || helpers.canUser('tickets:notes', true)) && (
                        <div className='uk-width-1-1 ticket-reply uk-clearfix'>
                          <Avatar image={this.props.shared.sessionUser.image} showOnlineBubble={false} />
                          <TruTabWrapper style={{ paddingLeft: 85 }}>
                            <TruTabSelectors showTrack={false}>
                              {helpers.canUser('comments:create', true) && (
                                <TruTabSelector selectorId={0} label={t('tickets.comment')} active={true} />
                              )}
                              {helpers.canUser('tickets:notes', true) && (
                                <TruTabSelector
                                  selectorId={1}
                                  label={t('tickets.internalNote')}
                                  active={!helpers.canUser('comments:create', true)}
                                />
                              )}
                            </TruTabSelectors>
                            <TruTabSection
                              sectionId={0}
                              style={{ paddingTop: 0 }}
                              active={helpers.canUser('comments:create', true)}
                            >
                              <form onSubmit={e => this.onCommentNoteSubmit(e, 'comment')}>
                                <EasyMDE
                                  allowImageUpload={true}
                                  inlineImageUploadUrl={'/tickets/uploadmdeimage'}
                                  inlineImageUploadHeaders={{ ticketid: this.ticket._id }}
                                  ref={r => (this.commentMDE = r)}
                                />
                                <div className='uk-width-1-1 uk-clearfix' style={{ marginTop: 50 }}>
                                  <div className='uk-float-right'>
                                    <button
                                      type='submit'
                                      className='uk-button uk-button-accent'
                                      style={{ padding: '10px 15px' }}
                                    >
                                      {t('tickets.postComment')}
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </TruTabSection>
                            <TruTabSection
                              sectionId={1}
                              style={{ paddingTop: 0 }}
                              active={!helpers.canUser('comments:create') && helpers.canUser('tickets:notes', true)}
                            >
                              <form onSubmit={e => this.onCommentNoteSubmit(e, 'note')}>
                                <EasyMDE
                                  allowImageUpload={true}
                                  inlineImageUploadUrl={'/tickets/uploadmdeimage'}
                                  inlineImageUploadHeaders={{ ticketid: this.ticket._id }}
                                  ref={r => (this.noteMDE = r)}
                                />
                                <div className='uk-width-1-1 uk-clearfix' style={{ marginTop: 50 }}>
                                  <div className='uk-float-right'>
                                    <button
                                      type='submit'
                                      className='uk-button uk-button-accent'
                                      style={{ padding: '10px 15px' }}
                                    >
                                      {t('tickets.saveNote')}
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </TruTabSection>
                          </TruTabWrapper>
                        </div>
                      )}

                    {/* Time Tracking Section */}
                    <TimeTrackingPartial
                      ticket={this.ticket}
                      dateFormat={this.props.common.dateFormat}
                      onAddTimeEntry={this.handleAddTimeEntry}
                      onUpdateEstimatedHours={this.handleUpdateEstimatedHours}
                      onEditTimeEntry={this.handleEditTimeEntry}
                      onRemoveTimeEntry={this.handleRemoveTimeEntry}
                    />
                  </div>
                </div>
              </div>
            </div>
            <OffCanvasEditor primaryLabel={t('tickets.saveEdit')} ref={r => (this.editorWindow = r)} />
          </Fragment>
        )}
      </div>
    )
  }
}

SingleTicketContainer.propTypes = {
  ticketId: PropTypes.string.isRequired,
  ticketUid: PropTypes.string.isRequired,
  shared: PropTypes.object.isRequired,
  sessionUser: PropTypes.object,
  socket: PropTypes.object.isRequired,
  common: PropTypes.object.isRequired,
  ticketTypes: PropTypes.object.isRequired,
  fetchTicketTypes: PropTypes.func.isRequired,
  groupsState: PropTypes.object.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  transferToThirdParty: PropTypes.func,
  ticketStatuses: PropTypes.object.isRequired,
  fetchTicketStatus: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  common: state.common.viewdata,
  shared: state.shared,
  sessionUser: state.shared.sessionUser,
  socket: state.shared.socket,
  ticketTypes: state.ticketsState.types,
  ticketStatuses: state.ticketsState.ticketStatuses,
  groupsState: state.groupsState
})

export default connect(mapStateToProps, {
  fetchTicketTypes,
  fetchGroups,
  fetchTicketStatus,
  unloadGroups,
  showModal,
  transferToThirdParty
})(SingleTicketContainer)
