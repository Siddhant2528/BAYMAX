const therapyService = require("./therapy.service")


// AI therapy recommendations
const getTherapyRecommendations = async(req,res)=>{

    try{

        const userId = req.user.userId

        const recommendations =
        await therapyService.generateTherapyRecommendation(userId)

        res.json({
            message:"Therapy recommendations generated",
            data:recommendations
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// Get therapy plan
const getTherapyPlan = async(req,res)=>{

    try{

        const userId = req.user.userId

        const plan = await therapyService.getTherapyPlan(userId)

        res.json({
            data:plan
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}



// Counselor creates therapy plan
const createTherapyPlan = async(req,res)=>{

    try{

        const counselorId = req.user.userId

        const plan = await therapyService.createTherapyPlan({
            ...req.body,
            counselorId
        })

        res.status(201).json({
            message:"Therapy plan created",
            data:plan
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


module.exports = {
    getTherapyRecommendations,
    getTherapyPlan,
    createTherapyPlan
}