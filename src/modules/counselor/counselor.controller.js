const counselorService = require("./counselor.service")



// dashboard overview
const getDashboard = async(req,res)=>{

    try{

        const counselorId = req.user.userId

        const stats =
        await counselorService.getDashboardStats(counselorId)

        res.json({
            data:stats
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// student list
const getStudents = async(req,res)=>{

    try{

        const counselorId = req.user.userId

        const students =
        await counselorService.getStudents(counselorId)

        res.json({
            data:students
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// student profile
const getStudentProfile = async(req,res)=>{

    try{

        const { id } = req.params

        const student =
        await counselorService.getStudentProfile(id)

        res.json({
            data:student
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// student mental health history
const getStudentHistory = async(req,res)=>{

    try{

        const { id } = req.params

        const history =
        await counselorService.getStudentHistory(id)

        res.json({
            data:history
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// emergency alerts
const getEmergencyAlerts = async(req,res)=>{

    try{

        const alerts =
        await counselorService.getEmergencyAlerts()

        res.json({
            data:alerts
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



module.exports = {
    getDashboard,
    getStudents,
    getStudentProfile,
    getStudentHistory,
    getEmergencyAlerts
}