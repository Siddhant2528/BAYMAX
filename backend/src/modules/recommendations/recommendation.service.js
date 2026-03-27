const {pool} = require("../../config/db")
const riskService = require("../risk/risk.service")

// get resources by type
const getResourcesByType = async(type) => {

    const result = await pool.query(
        `SELECT id,title,description,type,url
         FROM resources
         WHERE type=$1
         LIMIT 5`,
        [type]
    )

    return result.rows
}


const getRecommendations = async(userId)=>{

    // get AI risk score
    const riskData = await riskService.calculateRiskScore(userId)

    // latest PHQ9
    const phq = await pool.query(
        `SELECT score FROM assessment_results
         WHERE student_id=$1 AND test_type='PHQ9'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    )

    // latest GAD7
    const gad = await pool.query(
        `SELECT score FROM assessment_results
         WHERE student_id=$1 AND test_type='GAD7'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    )

    const phqScore = phq.rows[0]?.score || 0
    const gadScore = gad.rows[0]?.score || 0

    let recommendedTypes = []


    // anxiety detection
    if(gadScore >= 10){
        recommendedTypes.push("meditation")
    }

    // depression detection
    if(phqScore >= 10){
        recommendedTypes.push("motivation")
        recommendedTypes.push("therapy")
    }

    // high risk
    if(riskData.riskLevel === "HIGH" || riskData.riskLevel === "CRITICAL"){
        recommendedTypes.push("therapy")
    }

    // fallback
    if(recommendedTypes.length === 0){
        recommendedTypes.push("asmr")
        recommendedTypes.push("meditation")
    }


    // remove duplicates
    recommendedTypes = [...new Set(recommendedTypes)]


    let resources = []

    for(const type of recommendedTypes){

        const result = await getResourcesByType(type)

        resources = resources.concat(result)

    }

    return {
        riskLevel:riskData.riskLevel,
        recommendedTypes,
        resources
    }

}

module.exports = {
    getRecommendations
}