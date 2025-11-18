/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    1/20/19 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import { Provider } from 'react-redux'
import ReactDOM from 'react-dom'
import React from 'react'
import { TranslationProvider } from './i18n'

import DashboardContainer from 'containers/Dashboard'
import TicketsContainer from 'containers/Tickets/TicketsContainer'
import SingleTicketContainer from 'containers/Tickets/SingleTicketContainer'
import SettingsContainer from 'containers/Settings/SettingsContainer'
import AccountsContainer from 'containers/Accounts'
import AccountsImportContainer from 'containers/Accounts/AccountsImport'
import GroupsContainer from 'containers/Groups'
import TeamsContainer from 'containers/Teams'
import DepartmentsContainer from 'containers/Departments'
import NoticeContainer from 'containers/Notice/NoticeContainer'
import ProfileContainer from 'containers/Profile'
import MessagesContainer from 'containers/Messages'
import ReportsContainer from 'containers/Reports'
import AboutContainer from 'containers/About'

let storeReference

const withProviders = children => (
  <Provider store={storeReference}>
    <TranslationProvider>{children}</TranslationProvider>
  </Provider>
)

export default function (store) {
  storeReference = store

  if (document.getElementById('dashboard-container')) {
    const DashboardContainerWithProvider = withProviders(<DashboardContainer />)

    ReactDOM.render(DashboardContainerWithProvider, document.getElementById('dashboard-container'))
  }

  if (document.getElementById('tickets-container')) {
    const view = document.getElementById('tickets-container').getAttribute('data-view')
    const page = document.getElementById('tickets-container').getAttribute('data-page')
    let filter = document.getElementById('tickets-container').getAttribute('data-filter')
    filter = filter ? JSON.parse(filter) : {}

    const TicketsContainerWithProvider = withProviders(
      <TicketsContainer view={view} page={page} filter={filter} />
    )

    ReactDOM.render(TicketsContainerWithProvider, document.getElementById('tickets-container'))
  }

  if (document.getElementById('single-ticket-container')) {
    const ticketId = document.getElementById('single-ticket-container').getAttribute('data-ticket-id')
    const ticketUid = document.getElementById('single-ticket-container').getAttribute('data-ticket-uid')
    const SingleTicketContainerWithProvider = withProviders(
      <SingleTicketContainer ticketId={ticketId} ticketUid={ticketUid} />
    )

    ReactDOM.render(SingleTicketContainerWithProvider, document.getElementById('single-ticket-container'))
  }

  if (document.getElementById('profile-container')) {
    const ProfileContainerWithProvider = withProviders(<ProfileContainer />)

    ReactDOM.render(ProfileContainerWithProvider, document.getElementById('profile-container'))
  }

  if (document.getElementById('accounts-container')) {
    const title = document.getElementById('accounts-container').getAttribute('data-title')
    const view = document.getElementById('accounts-container').getAttribute('data-view')
    const AccountsContainerWithProvider = withProviders(<AccountsContainer title={title} view={view} />)

    ReactDOM.render(AccountsContainerWithProvider, document.getElementById('accounts-container'))
  }

  if (document.getElementById('accounts-import-container')) {
    const AccountsImportContainerWithProvider = withProviders(<AccountsImportContainer />)

    ReactDOM.render(AccountsImportContainerWithProvider, document.getElementById('accounts-import-container'))
  }

  if (document.getElementById('groups-container')) {
    const GroupsContainerWithProvider = withProviders(<GroupsContainer />)

    ReactDOM.render(GroupsContainerWithProvider, document.getElementById('groups-container'))
  }

  if (document.getElementById('teams-container')) {
    const TeamsContainerWithProvider = withProviders(<TeamsContainer />)

    ReactDOM.render(TeamsContainerWithProvider, document.getElementById('teams-container'))
  }

  if (document.getElementById('departments-container')) {
    const TeamsContainerWithProvider = withProviders(<DepartmentsContainer />)

    ReactDOM.render(TeamsContainerWithProvider, document.getElementById('departments-container'))
  }

  if (document.getElementById('messages-container')) {
    const conversation = document.getElementById('messages-container').getAttribute('data-conversation-id')
    const showNewConversation = document.getElementById('messages-container').getAttribute('data-show-new-convo')
    const MessagesContainterWithProvider = withProviders(
      <MessagesContainer initialConversation={conversation} showNewConvo={showNewConversation} />
    )

    ReactDOM.render(MessagesContainterWithProvider, document.getElementById('messages-container'))
  }

  if (document.getElementById('notices-container')) {
    const NoticeContainerWithProvider = withProviders(<NoticeContainer />)

    ReactDOM.render(NoticeContainerWithProvider, document.getElementById('notices-container'))
  }

  if (document.getElementById('reports-container')) {
    const ReportsContainerWithProvider = withProviders(<ReportsContainer />)

    ReactDOM.render(ReportsContainerWithProvider, document.getElementById('reports-container'))
  }

  if (document.getElementById('settings-container')) {
    const SettingsContainerWithProvider = withProviders(<SettingsContainer />)

    ReactDOM.render(SettingsContainerWithProvider, document.getElementById('settings-container'))
  }

  if (document.getElementById('about-container')) {
    const AboutContainerWithProvider = withProviders(<AboutContainer />)

    ReactDOM.render(AboutContainerWithProvider, document.getElementById('about-container'))
  }
}
