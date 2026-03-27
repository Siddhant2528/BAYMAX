const {pool} = require("../../config/db")


// get all resources
const getAllResources = async () => {

    const result = await pool.query(

        `SELECT id,title,description,type,url,created_at
         FROM resources
         ORDER BY created_at DESC`

    )

    return result.rows
}


// filter resources by type
const getResourcesByType = async (type) => {

    const result = await pool.query(

        `SELECT id,title,description,type,url
         FROM resources
         WHERE type=$1
         ORDER BY created_at DESC`,

        [type]
    )

    return result.rows
}


// get single resource
const getResourceById = async (id) => {

    const result = await pool.query(

        `SELECT id,title,description,type,url
         FROM resources
         WHERE id=$1`,

        [id]
    )

    return result.rows[0]
}


// create new resource
const createResource = async (data) => {

    const { title, description, type, url } = data

    const result = await pool.query(

        `INSERT INTO resources
        (title,description,type,url)
        VALUES($1,$2,$3,$4)
        RETURNING *`,

        [title, description, type, url]

    )

    return result.rows[0]
}


// delete resource
const deleteResource = async (id) => {

    await pool.query(

        `DELETE FROM resources
         WHERE id=$1`,

        [id]

    )

    return true
}

module.exports = {

    getAllResources,
    getResourcesByType,
    getResourceById,
    createResource,
    deleteResource

}