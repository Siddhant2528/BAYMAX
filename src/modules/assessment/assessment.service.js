const {pool} = require("../../config/db")

// calculate severity
const calculateSeverity = (score, type) => {

    if(type === "PHQ9"){

        if(score <= 4) return "minimal"
        if(score <= 9) return "mild"
        if(score <= 14) return "moderate"
        if(score <= 19) return "moderately_severe"
        return "severe"

    }

    if(type === "GAD7"){

        if(score <= 4) return "minimal"
        if(score <= 9) return "mild"
        if(score <= 14) return "moderate"
        return "severe"
    }
}


// calculate total score
const calculateScore = (answers) => {

    return answers.reduce((sum,value)=> sum + value , 0)
}


// submit assessment
const submitAssessment = async (userId, type, answers) => {

    const score = calculateScore(answers)

    const severity = calculateSeverity(score,type)

    const result = await pool.query(

        `INSERT INTO assessment_results
        (student_id,test_type,score,severity,answers)
        VALUES($1,$2,$3,$4,$5)
        RETURNING *`,

        [userId,type,score,severity,answers]
    )

    return result.rows[0]
}


// get result by id
const getAssessmentResult = async (id) => {

    const result = await pool.query(

        `SELECT id,test_type,score,severity,answers,created_at
         FROM assessment_results
         WHERE id=$1`,

        [id]
    )

    return result.rows[0]
}


// get user assessment history
const getAssessmentHistory = async (userId) => {

    const result = await pool.query(

        `SELECT id,test_type,score,severity,created_at
         FROM assessment_results
         WHERE student_id=$1
         ORDER BY created_at DESC`,

        [userId]
    )

    return result.rows
}


module.exports = {
    submitAssessment,
    getAssessmentResult,
    getAssessmentHistory
}