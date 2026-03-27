const {pool} = require("../../config/db")

// book appointment
const bookAppointment = async(data)=>{

    const {
        studentId,
        counselorId,
        appointmentDate,
        mode
    } = data

    let meetingLink = null

    // generate meeting link if online
    if(mode === "online"){
        meetingLink = `https://meet.baymax.app/${Date.now()}`
    }

    const result = await pool.query(

        `INSERT INTO appointments
        (student_id,counselor_id,appointment_date,mode,meeting_link)
        VALUES($1,$2,$3,$4,$5)
        RETURNING *`,

        [
            studentId,
            counselorId,
            appointmentDate,
            mode,
            meetingLink
        ]

    )

    return result.rows[0]
}



// get student appointments
const getStudentAppointments = async(studentId)=>{

    const result = await pool.query(

        `SELECT *
         FROM appointments
         WHERE student_id=$1
         ORDER BY appointment_date DESC`,

        [studentId]

    )

    return result.rows
}



// get counselor appointments
const getCounselorAppointments = async(counselorId)=>{

    const result = await pool.query(

        `SELECT *
         FROM appointments
         WHERE counselor_id=$1
         ORDER BY appointment_date DESC`,

        [counselorId]

    )

    return result.rows
}



// cancel appointment
const cancelAppointment = async(id)=>{

    const result = await pool.query(

        `UPDATE appointments
         SET status='cancelled'
         WHERE id=$1
         RETURNING *`,

        [id]

    )

    return result.rows[0]
}



// update appointment status
const updateAppointmentStatus = async(id,status)=>{

    const result = await pool.query(

        `UPDATE appointments
         SET status=$1
         WHERE id=$2
         RETURNING *`,

        [status,id]

    )

    return result.rows[0]
}



module.exports = {
    bookAppointment,
    getStudentAppointments,
    getCounselorAppointments,
    cancelAppointment,
    updateAppointmentStatus
}