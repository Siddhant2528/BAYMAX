const assessmentService = require("./assessment.service")
const { PHQ9, GAD7 } = require("./assessment.questions")


// get PHQ9 questions
const getPHQ9Questions = async (req,res)=>{

    res.json({
        test:"PHQ9",
        questions:PHQ9
    })
}


// get GAD7 questions
const getGAD7Questions = async (req,res)=>{

    res.json({
        test:"GAD7",
        questions:GAD7
    })
}


// submit PHQ9
const submitPHQ9 = async (req,res)=>{

    try{

        const userId = req.user.userId

        const { answers } = req.body

        const result = await assessmentService.submitAssessment(
            userId,
            "PHQ9",
            answers
        )

        res.status(201).json({
            message:"PHQ9 submitted",
            data:result
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// submit GAD7
const submitGAD7 = async (req,res)=>{

    try{

        const userId = req.user.userId

        const { answers } = req.body

        const result = await assessmentService.submitAssessment(
            userId,
            "GAD7",
            answers
        )

        res.status(201).json({
            message:"GAD7 submitted",
            data:result
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// get assessment result
const getResult = async (req,res)=>{

    try{

        const { id } = req.params

        const result = await assessmentService.getAssessmentResult(id)

        res.json({
            data:result
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


// get assessment history
const getHistory = async (req,res)=>{

    try{

        const userId = req.user.userId

        const history = await assessmentService.getAssessmentHistory(userId)

        res.json({
            data:history
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}


module.exports = {
    getPHQ9Questions,
    getGAD7Questions,
    submitPHQ9,
    submitGAD7,
    getResult,
    getHistory
}