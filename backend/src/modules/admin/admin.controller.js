const adminService = require("./admin.service")


// add counselor
const addCounselor = async(req,res)=>{

    try{

        const counselor =
        await adminService.addCounselor(req.body)

        res.status(201).json({
            message:"Counselor added successfully",
            data:counselor
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// remove counselor
const removeCounselor = async(req,res)=>{

    try{

        const { id } = req.params

        const counselor = await adminService.removeCounselor(id)

        res.json({
            message:"Counselor removed successfully",
            data:counselor
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// get all students
const getAllUsers = async(req,res)=>{

    try{

        const users = await adminService.getAllUsers()

        res.json({
            data:users
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// get all counselors
const getAllCounselors = async(req,res)=>{

    try{

        const counselors = await adminService.getAllCounselors()

        res.json({
            data:counselors
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// block user
const blockUser = async(req,res)=>{

    try{

        const { id } = req.params

        const user = await adminService.blockUser(id)

        res.json({
            message:"User blocked",
            data:user
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// unblock user
const unblockUser = async(req,res)=>{

    try{

        const { id } = req.params

        const user = await adminService.unblockUser(id)

        res.json({
            message:"User unblocked",
            data:user
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}
// get analytics
const getAnalytics = async(req,res)=>{
    try{
        const analytics = await adminService.getAnalyticsData()
        res.json({
            data:analytics
        })
    }catch(error){
        res.status(500).json({
            message:error.message
        })
    }
}


module.exports = {
    addCounselor,
    removeCounselor,
    getAllUsers,
    getAllCounselors,
    blockUser,
    unblockUser,
    getAnalytics
}