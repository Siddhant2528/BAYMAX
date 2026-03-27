const service = require('./sessionNotes.service');

/** POST /api/session-notes */
const createNote = async (req, res) => {
  try {
    const counselorId = req.user.userId;
    const { studentId, problemDescription, diagnosticsAdvices, sessionDate } = req.body;

    if (!studentId || !problemDescription || !diagnosticsAdvices) {
      return res.status(400).json({ success: false, message: 'studentId, problemDescription and diagnosticsAdvices are required.' });
    }

    const note = await service.createNote(
      counselorId,
      studentId,
      problemDescription,
      diagnosticsAdvices,
      sessionDate || new Date().toISOString()
    );

    return res.status(201).json({ success: true, data: note });
  } catch (err) {
    console.error('createNote error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/** GET /api/session-notes */
const getNotes = async (req, res) => {
  try {
    const counselorId = req.user.userId;
    const notes = await service.getNotesByCounselor(counselorId);
    return res.status(200).json({ success: true, data: notes });
  } catch (err) {
    console.error('getNotes error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { createNote, getNotes };
