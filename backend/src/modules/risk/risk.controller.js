const riskService = require("./risk.service")


const getRiskScore = async(req,res)=>{

    try{

        const userId = req.user.userId

        const risk = await riskService.calculateRiskScore(userId)

        res.json({
            message:"Risk score calculated",
            data:risk
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}

module.exports = {
    getRiskScore
}