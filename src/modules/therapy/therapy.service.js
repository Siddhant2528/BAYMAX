const {pool} = require("../../config/db")
const riskService = require("../risk/risk.service")

// Generate therapy recommendation
const generateTherapyRecommendation = async(userId)=>{

    const riskData = await riskService.calculateRiskScore(userId)

    // latest PHQ9 score
    const phq = await pool.query(
        `SELECT score FROM assessment_results
         WHERE student_id=$1 AND test_type='PHQ9'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    )

    // latest GAD7 score
    const gad = await pool.query(
        `SELECT score FROM assessment_results
         WHERE student_id=$1 AND test_type='GAD7'
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    )

    const phqScore = phq.rows[0]?.score || 0
    const gadScore = gad.rows[0]?.score || 0

    let therapyRecommendations = []

    // anxiety therapy
    if(gadScore >= 10){
        therapyRecommendations.push("Cognitive Behavioral Therapy (CBT)")
        therapyRecommendations.push("Breathing & Relaxation Exercises")
    }

    // depression therapy
    if(phqScore >= 10){
        therapyRecommendations.push("Behavioral Activation Therapy")
        therapyRecommendations.push("Mindfulness Therapy")
    }

    // high risk intervention
    if(riskData.riskLevel === "HIGH" || riskData.riskLevel === "CRITICAL"){
        therapyRecommendations.push("Immediate Counselor Intervention")
        therapyRecommendations.push("Weekly Therapy Sessions")
    }

    if(therapyRecommendations.length === 0){
        therapyRecommendations.push("General Stress Management")
    }

    return {
        phqScore,
        gadScore,
        riskLevel:riskData.riskLevel,
        therapyRecommendations
    }
}



// Get therapy plan assigned by counselor
const getTherapyPlan = async(userId)=>{

    const result = await pool.query(
        `SELECT *
         FROM therapy_plans
         WHERE student_id=$1
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
    )

    return result.rows[0]
}



// Counselor creates therapy plan
const createTherapyPlan = async(data)=>{

    const {
        studentId,
        counselorId,
        therapyType,
        medications,
        sessionFrequency,
        notes
    } = data

    const result = await pool.query(

        `INSERT INTO therapy_plans
        (student_id,counselor_id,therapy_type,medications,session_frequency,notes)
        VALUES($1,$2,$3,$4,$5,$6)
        RETURNING *`,

        [
            studentId,
            counselorId,
            therapyType,
            medications,
            sessionFrequency,
            notes
        ]

    )

    return result.rows[0]
}


module.exports = {
    generateTherapyRecommendation,
    getTherapyPlan,
    createTherapyPlan
}