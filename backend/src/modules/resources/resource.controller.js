const resourceService = require("./resource.service")


// get all resources
const getResources = async (req, res) => {

    try {

        const { type } = req.query

        let resources

        if (type) {

            resources = await resourceService.getResourcesByType(type)

        } else {

            resources = await resourceService.getAllResources()

        }

        res.json({
            data: resources
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })

    }

}


// get single resource
const getResource = async (req, res) => {

    try {

        const { id } = req.params

        const resource = await resourceService.getResourceById(id)

        res.json({
            data: resource
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })

    }

}


// create resource (admin)
const createResource = async (req, res) => {

    try {

        const resource = await resourceService.createResource(req.body)

        res.status(201).json({
            message: "Resource added",
            data: resource
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })

    }

}


// delete resource
const deleteResource = async (req, res) => {

    try {

        const { id } = req.params

        await resourceService.deleteResource(id)

        res.json({
            message: "Resource deleted"
        })

    } catch (error) {

        res.status(500).json({
            message: error.message
        })

    }

}

module.exports = {

    getResources,
    getResource,
    createResource,
    deleteResource

}