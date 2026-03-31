const aerpService = require('./aerp.service');

const getStudentAERPRecord = async (req, res) => {
    try {
        const { collegeId } = req.params;
        
        if (!collegeId) {
            return res.status(400).json({ message: "College ID is required" });
        }
        
        const record = await aerpService.getStudentAERPRecord(collegeId);
        
        if (!record) {
            return res.status(404).json({ message: "AERP record not found for this student" });
        }
        
        res.status(200).json({
            message: "AERP Data Fetched Successfully",
            data: record
        });
        
    } catch (error) {
        res.status(500).json({ message: "Internal server error connecting to AERP.", error: error.message });
    }
};

const getAttendanceLogs = async (req, res) => {
    try {
        const { collegeId } = req.params;

        if (!collegeId) {
            return res.status(400).json({ message: "College ID is required" });
        }

        const logs = await aerpService.getAttendanceLogs(collegeId);

        res.status(200).json({
            message: "Attendance Logs Fetched Successfully",
            data: logs
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error fetching attendance logs.", error: error.message });
    }
};

module.exports = {
    getStudentAERPRecord,
    getAttendanceLogs,
};