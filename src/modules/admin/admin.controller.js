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



// get all users
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


module.exports = {
    addCounselor,
    getAllUsers,
    blockUser,
    unblockUser
}