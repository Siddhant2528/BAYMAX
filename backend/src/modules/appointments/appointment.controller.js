const appointmentService = require("./appointment.service")


// book appointment
const bookAppointment = async(req,res)=>{

    try{

        const studentId = req.user.userId

        const appointment =
        await appointmentService.bookAppointment({
            ...req.body,
            studentId
        })

        res.status(201).json({
            message:"Appointment booked",
            data:appointment
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}

// get counselors
const getCounselors = async(req,res)=>{
    try{
        const counselors = await appointmentService.getCounselors()
        res.json({ data: counselors })
    }catch(error){
        res.status(500).json({ message: error.message })
    }
}



// get student appointments
const getStudentAppointments = async(req,res)=>{

    try{

        const studentId = req.user.userId

        const appointments =
        await appointmentService.getStudentAppointments(studentId)

        res.json({
            data:appointments
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// get counselor appointments
const getCounselorAppointments = async(req,res)=>{

    try{

        const counselorId = req.user.userId

        const appointments =
        await appointmentService.getCounselorAppointments(counselorId)

        res.json({
            data:appointments
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// cancel appointment
const cancelAppointment = async(req,res)=>{

    try{

        const { id } = req.params

        const appointment =
        await appointmentService.cancelAppointment(id)

        res.json({
            message:"Appointment cancelled",
            data:appointment
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// update appointment status
const updateAppointmentStatus = async(req,res)=>{

    try{

        const { id } = req.params
        const { status, appointmentDate, meetingLink } = req.body

        const appointment =
        await appointmentService.updateAppointmentStatus(id, status, appointmentDate, meetingLink)

        res.json({
            message:"Appointment updated",
            data:appointment
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



module.exports = {
    bookAppointment,
    getStudentAppointments,
    getCounselorAppointments,
    cancelAppointment,
    updateAppointmentStatus,
    getCounselors
}