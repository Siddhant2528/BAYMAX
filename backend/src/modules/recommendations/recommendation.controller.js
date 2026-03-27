const recommendationService = require("./recommendation.service")


const getRecommendations = async(req,res)=>{

    try{

        const userId = req.user.userId

        const recommendations =
        await recommendationService.getRecommendations(userId)

        res.json({
            message:"Personalized recommendations generated",
            data:recommendations
        })

    }catch(error){

        res.status(500).json({
            message:error.message
        })

    }

}

module.exports = {
    getRecommendations
}