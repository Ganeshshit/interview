const User = require('../models/User');

const userController = {
    // Get all interviewers
    getInterviewers: async (req, res) => {
        try {
            const interviewers = await User.find({ role: 'interviewer' })
                .select('name email expertise experience skills isActive')
                .sort({ name: 1 });

            res.status(200).json({
                success: true,
                data: interviewers
            });
        } catch (error) {
            console.error('Error fetching interviewers:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch interviewers'
            });
        }
    },

    // Get all candidates
    getCandidates: async (req, res) => {
        try {
            const candidates = await User.find({ role: 'candidate' })
                .select('name email skills experience')
                .sort({ name: 1 });

            res.status(200).json({
                success: true,
                data: candidates
            });
        } catch (error) {
            console.error('Error fetching candidates:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch candidates'
            });
        }
    },

    // Get user details
    getUserDetails: async (req, res) => {
        try {
            const { userId } = req.params;
            
            // Verify the requesting user has access to this data
            if (req.user._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            const user = await User.findById(userId)
                .select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Error fetching user details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user details'
            });
        }
    },

    getInterviewerProfile: async (req, res) => {
        try {
            const { interviewerId } = req.params;
            
            // Verify the requesting user is the interviewer
            if (req.user._id.toString() !== interviewerId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            const interviewer = await User.findById(interviewerId)
                .select('-password')
                .populate('expertise')
                .populate('skills');

            if (!interviewer) {
                return res.status(404).json({
                    success: false,
                    message: 'Interviewer not found'
                });
            }

            res.status(200).json({
                success: true,
                data: interviewer
            });
        } catch (error) {
            console.error('Error fetching interviewer profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch interviewer profile'
            });
        }
    },

    getAvailableCandidates: async (req, res) => {
        try {
            const candidates = await User.find({
                role: 'candidate',
                isActive: true
            })
            .select('name email skills experience')
            .sort({ name: 1 });

            res.status(200).json({
                success: true,
                data: candidates
            });
        } catch (error) {
            console.error('Error fetching available candidates:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch available candidates'
            });
        }
    },

    updateInterviewerProfile: async (req, res) => {
        try {
            const { interviewerId } = req.params;
            
            // Verify the requesting user is the interviewer
            if (req.user._id.toString() !== interviewerId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            const updateData = req.body;
            delete updateData.password; // Prevent password update through this route

            const interviewer = await User.findByIdAndUpdate(
                interviewerId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!interviewer) {
                return res.status(404).json({
                    success: false,
                    message: 'Interviewer not found'
                });
            }

            res.status(200).json({
                success: true,
                data: interviewer
            });
        } catch (error) {
            console.error('Error updating interviewer profile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update interviewer profile'
            });
        }
    }
};

module.exports = userController; 