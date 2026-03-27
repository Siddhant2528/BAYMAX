const {pool} = require("../../config/db")
const { sendAppointmentConfirmation, sendAppointmentConfirmedToStudent } = require("../notifications/notification.service")

// book appointment
const bookAppointment = async(data)=>{

    const {
        studentId,
        counselorId,
        appointmentDate,
        mode
    } = data

    // Check if user has booked an appointment in the last 7 days
    const recent = await pool.query(
        `SELECT created_at FROM appointments
         WHERE student_id=$1
         ORDER BY created_at DESC LIMIT 1`,
         [studentId]
    );

    if (recent.rows.length > 0) {
        const lastBooked = new Date(recent.rows[0].created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        if (lastBooked > sevenDaysAgo) {
            throw new Error('You have already booked a session in the last 7 days. Please wait until next week to schedule another.');
        }
    }

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

    // Send confirmation to Counselor
    try {
        const studentQuery = await pool.query(`SELECT name FROM users WHERE id=$1`, [studentId]);
        const counselorQuery = await pool.query(`SELECT email, guardian_phone FROM users WHERE id=$1`, [counselorId]);
        
        if (studentQuery.rows.length > 0 && counselorQuery.rows.length > 0) {
            const studentName = studentQuery.rows[0].name;
            const counselorEmail = counselorQuery.rows[0].email;
            const counselorPhone = counselorQuery.rows[0].guardian_phone;
            
            await sendAppointmentConfirmation(counselorEmail, counselorPhone, studentName, appointmentDate);
        }
    } catch(err) {
        console.error("Failed to send appointment notification:", err.message);
    }

    return result.rows[0]
}

// get all counselors
const getCounselors = async()=>{
    const result = await pool.query(`SELECT id, name, email FROM users WHERE role='counselor'`)
    return result.rows
}



// get student appointments
const getStudentAppointments = async(studentId)=>{

    const result = await pool.query(

        `SELECT a.*, u.name AS counselor_name, u.email AS counselor_email
         FROM appointments a
         JOIN users u ON u.id = a.counselor_id
         WHERE a.student_id=$1
         ORDER BY a.appointment_date DESC`,

        [studentId]

    )

    return result.rows
}



// get counselor appointments — JOIN with users for full student details
const getCounselorAppointments = async(counselorId)=>{

    const result = await pool.query(

        `SELECT a.*,
                u.name    AS student_name,
                u.email   AS student_email,
                u.department,
                u.guardian_phone,
                u.student_contact,
                phq.score    AS phq9_score,
                phq.severity AS phq9_severity,
                gad.score    AS gad7_score,
                gad.severity AS gad7_severity
         FROM appointments a
         JOIN users u ON u.id = a.student_id
         LEFT JOIN LATERAL (
             SELECT score, severity FROM assessment_results
             WHERE student_id = a.student_id AND test_type = 'PHQ9'
             ORDER BY created_at DESC LIMIT 1
         ) phq ON true
         LEFT JOIN LATERAL (
             SELECT score, severity FROM assessment_results
             WHERE student_id = a.student_id AND test_type = 'GAD7'
             ORDER BY created_at DESC LIMIT 1
         ) gad ON true
         WHERE a.counselor_id=$1
         ORDER BY a.appointment_date DESC`,

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
const updateAppointmentStatus = async(id, status, appointmentDate, meetingLink)=>{

    let setClauses = ['status=$1'];
    let values = [status];
    let paramIdx = 2;

    if (appointmentDate) {
        setClauses.push(`appointment_date=$${paramIdx++}`);
        values.push(appointmentDate);
    }
    if (meetingLink !== undefined) {
        setClauses.push(`meeting_link=$${paramIdx++}`);
        values.push(meetingLink);
    }
    values.push(id);

    const result = await pool.query(
        `UPDATE appointments
         SET ${setClauses.join(', ')}
         WHERE id=$${paramIdx}
         RETURNING *`,
        values
    );
    
    const appointment = result.rows[0];

    // Send confirmation to student when counselor confirms
    if (status === 'confirmed' && appointment) {
        try {
            const studentQuery = await pool.query(`SELECT id, email, name FROM users WHERE id=$1`, [appointment.student_id]);
            if (studentQuery.rows.length > 0) {
                const { id: studentUserId, email: studentEmail, name: studentName } = studentQuery.rows[0];
                
                // Send email
                await sendAppointmentConfirmedToStudent(studentEmail, appointment.appointment_date);

                // Save in-app notification
                const formattedDate = new Date(appointment.appointment_date).toLocaleString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                const linkMsg = appointment.meeting_link
                    ? `\n\n🔗 Join your session: ${appointment.meeting_link}`
                    : '';
                await pool.query(
                    `INSERT INTO notifications (user_id, type, message)
                     VALUES ($1, $2, $3)`,
                    [
                        studentUserId,
                        'appointment_confirmed',
                        `Hi ${studentName}! 🎉 Your appointment has been confirmed for ${formattedDate}.${linkMsg}`
                    ]
                );
            }
        } catch(err) {
            console.error("Failed to send student confirmation:", err.message);
        }
    }

    return appointment;
}



module.exports = {
    bookAppointment,
    getStudentAppointments,
    getCounselorAppointments,
    cancelAppointment,
    updateAppointmentStatus,
    getCounselors
}