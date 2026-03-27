const notificationService =
require("./notification.service")


// emergency notification
const sendEmergencyNotification = async(req,res)=>{

    try{

        await notificationService.sendEmergencyNotification(req.body)

        res.json({
            message:"Emergency notification sent"
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// appointment reminder
const sendAppointmentReminder = async(req,res)=>{

    try{

        await notificationService.sendAppointmentReminder(req.body)

        res.json({
            message:"Appointment reminder sent"
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// therapy reminder
const sendTherapyReminder = async(req,res)=>{

    try{

        await notificationService.sendTherapyReminder(req.body)

        res.json({
            message:"Therapy reminder sent"
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// get notification history
const getNotifications = async(req,res)=>{

    try{

        const userId = req.user.userId

        const notifications =
        await notificationService.getNotifications(userId)

        res.json({
            data:notifications
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


module.exports = {
    sendEmergencyNotification,
    sendAppointmentReminder,
    sendTherapyReminder,
    getNotifications
}