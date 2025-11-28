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

module.exports = {
  v1: {
    common: require('./v1/common'),
    elasticsearch: require('./v1/elasticsearch'),
    groups: require('./v1/groups'),
    messages: require('./v1/messages'),
    modules: require('./v1/modules'),
    notices: require('./v1/notices'),
    plugins: require('./v1/plugins'),
    products: require('./v1/products'),
    reports: require('./v1/reports'),
    roles: require('./v1/roles'),
    settings: require('./v1/settings'),
    tags: require('./v1/tags'),
    tickets: require('./v1/tickets'),
    users: require('./v1/users'),
    webhooks: require('./v1/webhooks')
  },
  v2: {
    accounts: require('./v2/accounts'),
    common: require('./v2/common'),
    departments: require('./v2/departments'),
    elasticsearch: require('./v2/elasticsearch'),
    emailTemplates: require('./v2/emailTemplates'),
    groups: require('./v2/groups'),
    mailer: require('./v2/mailer'),
    messages: require('./v2/messages'),
    notificationRules: require('./v2/notificationRules'),
    notices: require('./v2/notices'),
    userNotificationPreferences: require('./v2/userNotificationPreferences'),
    reports: require('./v2/reports'),
    roles: require('./v2/roles'),
    settings: require('./v2/settings'),
    tags: require('./v2/tags'),
    teams: require('./v2/teams'),
    tickets: require('./v2/tickets'),
    types: require('./v2/types')
  }
}
