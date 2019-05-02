let JDate = require("jalali-date")
let mssql = require("mssql")
let Connection = require("../connection")
// let Data = require("../data")

////////////////////////////////////// MODULES_IMPORTS_ENDED

const addNotification = ({event_id, notification, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`update events set notification = N'${notification}' where id = '${event_id}'`, (error) =>
    {
        if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
        else
        {
            response.send({state: 1, log: `SUCCESSFUL_ADD_NOTIFICATION_TO_EVENT`})
        }
    })
}

const getUserShortNotification = ({user_id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select * from users where id = N'${user_id}'`, (error, records) =>
    {
        if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
        else
        {
            if (records.recordset.length > 0)
            {
                let user = records.recordset[0]
                let user_categories_arr = JSON.parse(user.categories)

                if (user_categories_arr !== null && user_categories_arr.length > 0)
                {
                    let Jdate = new JDate()
                    // let date = new Date()
                    // let current_date_abel = Jdate.date[0] * 365 + (Jdate.date[1] - 1) * 30 + Jdate.date[2]
                    /** @namespace Jdate.date */
                    let current_year = Jdate.date[0]
                    let current_month = Jdate.date[1]
                    let current_day = Jdate.date[2]

                    let selected_events = []

                    user_categories_arr.forEach((category_id, cat_inx) =>
                    {
                        // let request = new mssql.Request(Connection.connection)
                        request.query(`
                            select id, category_id, name, notification, is_long from events where
                            category_id = '${category_id}'
                            and (is_long = 'false')
                            and (start_year >= ${current_year})
                            and (start_month >= ${current_month} or start_month = ${current_month === 12 ? 1 : current_month})
                            and (start_day >= ${current_day} or start_day =
                            ${current_month <= 6 ?
                            current_day === 31 ?
                                1 : current_day
                            : current_month !== 12 ?
                                current_day === 30 ?
                                    1 : current_day
                                : current_day === 29 ?
                                    1 : current_day
                                })`
                            , (err, event_records) =>
                            {
                                if (err) response.send({
                                    state: -7,
                                    log: "DATA_BASE_ERROR",
                                    form: err,
                                })
                                else if (event_records.recordset.length > 0)
                                {
                                    event_records.recordset.forEach((evnts, event_inx) =>
                                    {
                                        selected_events.push(evnts)
                                        if (user_categories_arr.length - 1 === cat_inx && event_records.recordset.length - 1 === event_inx)  // last cat with event
                                        {
                                            setTimeout(() =>
                                            {
                                                processLongEvents(selected_events, response, user_id)
                                            }, 30)
                                        }
                                    })
                                }
                                else if (user_categories_arr.length - 1 === cat_inx) // last cat without event
                                {
                                    setTimeout(() =>
                                    {
                                        processLongEvents(selected_events, response, user_id)
                                    }, 30)
                                }
                            })
                    })
                }
                else response.send({
                    state: 0,
                    log: `USER_${user_id}_HAVE_NO_FAVORITES`,
                    form: user_categories_arr ? user_categories_arr : [],
                })
            }
            else response.send({
                state: -6,
                log: `USER_${user_id}_NOT_FOUND`,
                form: records.recordset ? records.recordset : [],
            })
        }
    })
}

const getUserLongNotification = ({user_id, response}) =>
{
    let request = new mssql.Request(Connection.connection)
    request.query(`select * from users where id = N'${user_id}'`, (error, records) =>
    {
        if (error) response.send({state: -5, log: "DATA_BASE_ERROR", form: error})
        else
        {
            if (records.recordset.length > 0)
            {
                let user = records.recordset[0]
                let user_categories_arr = JSON.parse(user.categories)

                if (user_categories_arr !== null && user_categories_arr.length > 0)
                {
                    let Jdate = new JDate()
                    // let date = new Date()
                    /** @namespace Jdate.date */
                    let current_date_abel = Jdate.date[0] * 365 + (Jdate.date[1] - 1) * 30 + Jdate.date[2]

                    let selected_events = []

                    user_categories_arr.forEach((category_id, cat_inx) =>
                    {
                        // let request = new mssql.Request(Connection.connection)
                        request.query(
                            `select id, category_id, name, notification, is_long from events where
                            category_id = '${category_id}'
                            and (is_long = 'true')
                            and ((start_year * 365 + (start_month - 1) * 30 + start_day) <= ${current_date_abel} and (end_year * 365 + (end_month - 1) * 30 + end_day) >= ${current_date_abel})`
                            , (err, event_records) =>
                            {
                                if (err) response.send({
                                    state: -7,
                                    log: "DATA_BASE_ERROR",
                                    form: err,
                                })
                                else if (event_records.recordset.length > 0)
                                {
                                    event_records.recordset.forEach((evnts, event_inx) =>
                                    {
                                        selected_events.push(evnts)
                                        if (user_categories_arr.length - 1 === cat_inx && event_records.recordset.length - 1 === event_inx)  // last cat with event
                                        {
                                            setTimeout(() =>
                                            {
                                                processLongEvents(selected_events, response, user_id)
                                            }, 30)
                                        }
                                    })
                                }
                                else if (user_categories_arr.length - 1 === cat_inx) // last cat without event
                                {
                                    setTimeout(() =>
                                    {
                                        processLongEvents(selected_events, response, user_id)
                                    }, 30)
                                }
                            })
                    })
                }
                else response.send({
                    state: 0,
                    log: `USER_${user_id}_HAVE_NO_FAVORITES`,
                    form: user_categories_arr ? user_categories_arr : [],
                })
            }
            else response.send({
                state: -6,
                log: `USER_${user_id}_NOT_FOUND`,
                form: records.recordset ? records.recordset : [],
            })
        }
    })
}

function processLongEvents(events, response, user_id)
{
    if (events.length > 0)
    {
        let events_notifications = []
        events.forEach((event, event_index) =>
        {
            if (events.length - 1 === event_index)
            {
                let event_notifications = event.notification ? JSON.parse(event.notification) : []
                event_notifications.length > 0 && event_notifications.forEach(notification =>
                {
                    events_notifications.push({
                        category_id: event.category_id,
                        event_id: event.id,
                        event_name: event.name,
                        notification_id: notification.id,
                        notification_title: notification.title,
                        notification_description: notification.description,
                        notification_date: notification.date,
                        notification_time: notification.time,
                        notification_hour_minute: [parseInt(notification.time.split(":")[0], 10), parseInt(notification.time.split(":")[1], 10)],
                    })
                })
                setTimeout(() =>
                {
                    processNotifications(events_notifications, response, user_id)
                }, 30)
            }
            else
            {
                let event_notifications = event.notification ? JSON.parse(event.notification) : []
                event_notifications.length > 0 && event_notifications.forEach(notification =>
                {
                    events_notifications.push({
                        category_id: event.category_id,
                        event_id: event.id,
                        event_name: event.name,
                        notification_id: notification.id,
                        notification_title: notification.title,
                        notification_description: notification.description,
                        notification_date: notification.date,
                        notification_time: notification.time,
                        notification_hour_minute: [parseInt(notification.time.split(":")[0], 10), parseInt(notification.time.split(":")[1], 10)],
                    })
                })
            }
        })
    }
    else
    {
        response.send({
            state: 0,
            log: `NO_EVENT_AVAILABLE_FOR_USER_${user_id}`,
            form: [],
        })
    }
}

function processNotifications(notifications, response, user_id)
{
    let Jdate = new JDate()
    let date = new Date()
    /** @namespace Jdate.date */
    let current_date = `${Jdate.date[0]}/${Jdate.date[1]}/${Jdate.date[2]}`
    let current_time = [date.getHours(), date.getMinutes()]

    if (notifications.length > 0)
    {
        let on_time_notifications = []
        notifications.forEach((notification, index) =>
        {
            if (notifications.length - 1 === index)
            {
                if (notification.notification_date === current_date)
                {
                    if (notification.notification_hour_minute[0] === current_time[0])
                    {
                        if (current_time[1] - 8 <= notification.notification_hour_minute[1] && current_time[1] + 8 >= notification.notification_hour_minute[1])
                        {
                            on_time_notifications.push(notification)
                        }
                    }
                    else if (notification.notification_hour_minute[0] === current_time[0] + 1)
                    {
                        if (notification.notification_hour_minute[1] <= 10 && current_time[1] >= 50)
                        {
                            on_time_notifications.push(notification)
                        }
                    }
                    else if (notification.notification_hour_minute[0] === current_time[0] - 1)
                    {
                        if (notification.notification_hour_minute[1] >= 50 && current_time[1] <= 10)
                        {
                            on_time_notifications.push(notification)
                        }
                    }
                }
                setTimeout(() =>
                {
                    processOnTimeNotifications(on_time_notifications, response, user_id)
                }, 30)
            }
            else
            {
                if (notification.notification_date === current_date)
                {
                    if (notification.notification_hour_minute[0] === current_time[0])
                    {
                        if (current_time[1] - 8 <= notification.notification_hour_minute[1] && current_time[1] + 8 >= notification.notification_hour_minute[1])
                        {
                            on_time_notifications.push(notification)
                        }
                    }
                    else if (notification.notification_hour_minute[0] === current_time[0] + 1)
                    {
                        if (notification.notification_hour_minute[1] <= 10 && current_time[1] >= 50)
                        {
                            on_time_notifications.push(notification)
                        }
                    }
                    else if (notification.notification_hour_minute[0] === current_time[0] - 1)
                    {
                        if (notification.notification_hour_minute[1] >= 50 && current_time[1] <= 10)
                        {
                            on_time_notifications.push(notification)
                        }
                    }
                }
            }
        })
    }
    else
    {
        response.send({
            state: 0,
            log: `NO_NOTIFICATION_AVAILABLE_FOR_USER_${user_id}`,
            form: [],
        })
    }
}

function processOnTimeNotifications(notifications, response, user_id)
{
    if (notifications.length > 0)
    {
        let request = new mssql.Request(Connection.connection)
        let ready_to_send_notifications = []
        notifications.forEach((notification, index) =>
        {
            let Jdate = new JDate()
            let date = new Date()
            /** @namespace Jdate.date */
            let current_date = `${Jdate.date[0]}/${Jdate.date[1]}/${Jdate.date[2]}`
            let current_time = [date.getHours(), date.getMinutes()]
            if (notifications.length - 1 === index)
            {
                request.query(`
                select * from log where 
                user_id = ${user_id} and 
                event_id = ${notification.event_id} and 
                notification_id = ${notification.notification_id}
                `, (error, logs) =>
                {
                    if (error) response.send({state: -6, log: "DATA_BASE_ERROR", form: error})
                    else
                    {
                        if (logs.recordset.length === 0)
                        {
                            ready_to_send_notifications.push(notification)
                            request.query(`
                            insert into log (user_id, event_id, notification_id, deliver_time, deliver_date)
                            values (
                            ${user_id}, 
                            ${notification.event_id}, 
                            ${notification.notification_id}, 
                            '${current_time[0]}:${current_time[1]}', 
                            '${current_date}')
                            `, (log_err) => log_err ? console.log("LOG_NOTIFICATION_ERROR", log_err) : null)
                        }
                        setTimeout(() =>
                        {
                            response.send({
                                state: ready_to_send_notifications.length > 0 ? 1 : 0,
                                log: `USER_${user_id}_ON_TIME_NOTIFICATIONS`,
                                form: ready_to_send_notifications,
                            })
                        }, 30)
                    }
                })
            }
            else
            {
                request.query(`
                select * from log where 
                user_id = ${user_id} and 
                event_id = ${notification.event_id} and 
                notification_id = ${notification.notification_id}
                `, (error, logs) =>
                {
                    if (error) response.send({state: -6, log: "DATA_BASE_ERROR", form: error})
                    else
                    {
                        if (logs.recordset.length === 0)
                        {
                            ready_to_send_notifications.push(notification)
                            request.query(`
                            insert into log (user_id, event_id, notification_id, deliver_time, deliver_date)
                            values (
                            ${user_id}, 
                            ${notification.event_id}, 
                            ${notification.notification_id}, 
                            '${current_time[0]}:${current_time[1]}', 
                            '${current_date}')
                            `, (log_err) => log_err ? console.log("LOG_NOTIFICATION_ERROR", log_err) : null)
                        }
                    }
                })
            }
        })
    }
    else
    {
        response.send({
            state: 0,
            log: `NO_ON_TIME_NOTIFICATION_AVAILABLE_FOR_USER_${user_id}`,
            form: [],
        })
    }
}


module.exports =
    {
        addNotification: addNotification,
        getUserShortNotification: getUserShortNotification,
        getUserLongNotification: getUserLongNotification,
    }