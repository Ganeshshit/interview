const { v4: uuidv4 } = require('uuid');
const Interview = require('../models/Interview');
const Question = require('../models/Question');
const { createSignaling, getRoomStatus } = require('../service/signalingService');
const { EventEmitter } = require('events');
const rooms = new Map(); // Store room state
const { sendEmail, emailTemplates } = require('../utils/emailService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailController = require('../controllers/emailController');
const { validationResult } = require('express-validator');
const { default: mongoose } = require('mongoose');

// Create event emitter for each room
const getRoomEmitter = (roomId) => {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            emitter: new EventEmitter(),
            participants: new Set(),
            offers: [],
            answers: [],
            iceCandidates: []
        });
    }
    return rooms.get(roomId);
};

const interviewController = {

    createInterview: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const roomId = uuidv4();
            const { interviewerId, scheduledTime } = req.body;
            const interview = await Interview.create({
                interviewerId,
                scheduledTime,
                status: 'scheduled',
                roomId: roomId
            });
            res.status(201).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    joinInterview: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { id } = req.params;
            const { userId, role } = req.body;

            console.log('Join interview request:', { id, userId, role });

            // Find the interview
            const interview = await Interview.findById(id)
                .populate('candidateId', 'name email')
                .populate('interviewerId', 'name email');

            console.log('Found interview:', interview);

            if (!interview) {
                return res.status(404).json({
                    success: false,
                    message: 'Interview not found'
                });
            }

            // Verify user's role and permission
            if (role === 'interviewer' && interview.interviewerId.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized as interviewer'
                });
            }
            if (role === 'candidate') {
                console.log('Candidate check:', {
                    hasCandidateId: !!interview.candidateId,
                    candidateId: interview.candidateId?._id?.toString(),
                    userId
                });
                // If candidateId is not set, set it to the current user
                if (!interview.candidateId) {
                    interview.candidateId = userId;
                    await interview.save();
                    console.log('Set candidateId to:', userId);
                } else if (interview.candidateId._id.toString() !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Not authorized as candidate'
                    });
                }
            }

            // Update interview status to 'scheduled' if it's 'completed'
            if (interview.status === 'completed') {
                interview.status = 'scheduled';
                await interview.save();
                console.log('Updated interview status from completed to scheduled');
            }

            // Check if interview is scheduled (case-insensitive)
            const normalizedStatus = interview.status.toLowerCase();
            console.log('Interview status:', { original: interview.status, normalized: normalizedStatus });

            if (normalizedStatus !== 'scheduled' && normalizedStatus !== 'in-progress') {
                return res.status(400).json({
                    success: false,
                    message: `Interview is not available (current status: ${interview.status})`
                });
            }

            // Update interview status if not already started
            if (normalizedStatus === 'scheduled') {
                interview.status = 'in-progress';
                await interview.save();
                console.log('Updated interview status to in-progress');
            }

            // Return meeting details
            res.status(200).json({
                success: true,
                message: 'Successfully joined the interview',
                data: {
                    meetingLink: interview.meetingLink,
                    roomId: interview.roomId,
                    interviewDetails: {
                        topic: interview.topic,
                        scheduledTime: interview.scheduledTime,
                        duration: interview.duration,
                        otherParty: role === 'candidate'
                            ? interview.interviewerId
                            : interview.candidateId,
                        currentQuestion: interview.currentQuestion
                    }
                }
            });
        } catch (error) {
            console.error('Error joining interview:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to join interview',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    leaveInterview : async (req, res) => {
        try {
            const { id } = req.params;

            // ✅ Validate MongoDB ObjectId
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid interview ID"
                });
            }

            // 🔍 Fetch interview from DB
            const interview = await Interview.findById(id);
            if (!interview) {
                return res.status(404).json({
                    success: false,
                    message: "Interview not found"
                });
            }

            // 👤 Get userId (from auth middleware, fallback to "Unknown")
            const userId = req.user?.id || "Unknown";

            // 🕓 Log leave activity safely
            interview.activityLog = interview.activityLog || [];
            interview.activityLog.push({
                userId,
                action: "leave",
                timestamp: new Date(),
            });

            // 👋 Remove user from participants if array exists
            if (Array.isArray(interview.participants)) {
                interview.participants = interview.participants.filter(
                    participant => participant.toString() !== userId
                );
            }

            // 🔚 Optional: mark interview as ended if no one is left
            if (!interview.participants || interview.participants.length === 0) {
                interview.status = "ended";
            }

            // 💾 Save changes to DB
            await interview.save();

            // ✅ Respond to client
            return res.status(200).json({
                success: true,
                message: "Successfully left interview",
                data: {
                    interviewId: id,
                    userId,
                    leaveTime: new Date()
                }
            });

        } catch (error) {
            console.error("❌ Error in leaveInterview:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
},

    getInterview: async (req, res) => {
        try {
            const interview = await Interview.findById(req.params.id)
                .populate('currentQuestion');
            res.status(200).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    updateInterview: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Remove any fields that shouldn't be updated
            delete updateData._id;
            delete updateData.interviewerId;
            delete updateData.candidateId;
            delete updateData.roomId;

            const interview = await Interview.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!interview) {
                return res.status(404).json({
                    success: false,
                    message: 'Interview not found'
                });
            }

            res.status(200).json({
                success: true,
                data: interview
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating interview',
                error: error.message
            });
        }
    },

    endInterview: async (req, res) => {
        try {
            const { id } = req.params;
            const interview = await Interview.findById(id);

            if (!interview) {
                return res.status(404).json({ success: false, message: 'Interview not found' });
            }

            interview.status = 'completed';
            await interview.save();

            res.json({ success: true, message: 'Interview ended successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    submitCode: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ success: false, errors: errors.array() });
            }

            const { interviewId, code, language } = req.body;
            const interview = await Interview.findById(interviewId);

            if (!interview) {
                return res.status(404).json({ success: false, message: 'Interview not found' });
            }

            interview.submittedCode = {
                code,
                language,
                submittedAt: new Date()
            };
            await interview.save();

            res.json({ success: true, message: 'Code submitted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getQuestions: async (req, res) => {
        try {
            const questions = await Question.find();
            res.status(200).json({ success: true, questions });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    assignQuestion: async (req, res) => {
        try {
            const { interviewId, questionId } = req.body;
            const interview = await Interview.findByIdAndUpdate(
                interviewId,
                { currentQuestion: questionId },
                { new: true }
            ).populate('currentQuestion');
            res.status(200).json({ success: true, interview });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    scheduleInterview: async (req, res) => {
        try {
            const {
                candidateId,
                scheduledTime,
                duration,
                topic,
                roomId,
                meetingLink,
                status
            } = req.body;

            // Validate required fields
            if (!candidateId || !scheduledTime || !duration || !topic || !roomId || !meetingLink) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields'
                });
            }

            // Create new interview
            const interview = new Interview({
                interviewerId: req.user._id, // Get interviewer ID from authenticated user
                candidateId,
                scheduledTime,
                duration,
                topic,
                roomId,
                meetingLink,
                status
            });

            await interview.save();

            // Send email notification to candidate
            const candidate = await User.findById(candidateId);
            if (candidate) {
                await emailController.sendMeetingEmail({
                    receiverEmail: candidate.email,
                    candidateName: candidate.name,
                    interviewerName: req.user.name,
                    roomLink: meetingLink,
                    interviewTime: new Date(scheduledTime).toLocaleString(),
                    message: req.body.message || 'You have been scheduled for an interview.'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Interview scheduled successfully',
                interview
            });
        } catch (error) {
            console.error('Error scheduling interview:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to schedule interview',
                error: error.message
            });
        }
    },

    getUpcomingInterviews: async (req, res) => {
        try {
            const { userId } = req.params;
            const interviews = await Interview.find({
                $or: [
                    { interviewerId: userId },
                    { candidateId: userId }
                ],
                status: 'scheduled',
                scheduledTime: { $gt: new Date() }
            }).sort({ scheduledTime: 1 });

            res.json({ success: true, interviews });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCompletedInterviews: async (req, res) => {
        try {
            const { userId } = req.params;
            const interviews = await Interview.find({
                $or: [
                    { interviewerId: userId },
                    { candidateId: userId }
                ],
                status: 'completed'
            }).sort({ scheduledTime: -1 });

            res.json({ success: true, interviews });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getUpcomingInterviewsForInterviewer: async (req, res) => {
        try {
            const { interviewerId } = req.params;

            // Verify the requesting user is the interviewer
            if (req.user._id.toString() !== interviewerId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            const currentDate = new Date();

            const interviews = await Interview.find({
                interviewerId,
                status: 'scheduled',
                scheduledTime: { $gt: currentDate }
            })
                .populate('candidateId', 'name email skills experience')
                .sort({ scheduledTime: 1 });

            res.status(200).json({
                success: true,
                data: interviews
            });
        } catch (error) {
            console.error('Error fetching upcoming interviews for interviewer:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch upcoming interviews'
            });
        }
    },

    getUpcomingInterviewsForCandidate: async (req, res) => {
        try {
            const { candidateId } = req.params;

            // Verify the requesting user is the candidate
            if (req.user._id.toString() !== candidateId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            const currentDate = new Date();

            // Find upcoming interviews for the candidate
            const interviews = await Interview.find({
                candidateId,
                status: 'scheduled',
                scheduledTime: { $gt: currentDate }
            })
                .populate('interviewerId', 'name email expertise')
                .sort({ scheduledTime: 1 });

            // Process the interviews to include additional details
            const processedInterviews = interviews.map(interview => ({
                _id: interview._id,
                topic: interview.topic,
                scheduledTime: interview.scheduledTime,
                duration: interview.duration,
                status: interview.status,
                roomId: interview.roomId,
                meetingLink: interview.meetingLink,
                interviewer: {
                    name: interview.interviewerId.name,
                    email: interview.interviewerId.email,
                    expertise: interview.interviewerId.expertise,
                    experience: interview.interviewerId.experience
                }
            }));

            res.status(200).json({
                success: true,
                data: processedInterviews
            });
        } catch (error) {
            console.error('Error fetching upcoming interviews for candidate:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch upcoming interviews'
            });
        }
    },

    getCompletedInterviewsForInterviewer: async (req, res) => {
        try {
            const { interviewerId } = req.params;

            // Verify the requesting user is the interviewer
            if (req.user._id.toString() !== interviewerId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            const currentDate = new Date();

            const interviews = await Interview.find({
                interviewerId,
                $or: [
                    { status: 'completed' },
                    {
                        status: 'scheduled',
                        scheduledTime: { $lt: currentDate }
                    }
                ]
            })
                .populate('candidateId', 'name email skills experience')
                .sort({ scheduledTime: -1 });

            res.status(200).json({
                success: true,
                data: interviews
            });
        } catch (error) {
            console.error('Error fetching completed interviews for interviewer:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch completed interviews'
            });
        }
    },

    getCompletedInterviewsForCandidate: async (req, res) => {
        try {
            const { candidateId } = req.params;

            // Verify the requesting user is the candidate
            if (req.user._id.toString() !== candidateId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            const currentDate = new Date();

            const interviews = await Interview.find({
                candidateId,
                $or: [
                    { status: 'completed' },
                    {
                        status: 'scheduled',
                        scheduledTime: { $lt: currentDate }
                    }
                ]
            })
                .populate('interviewerId', 'name email expertise experience')
                .sort({ scheduledTime: -1 });

            res.status(200).json({
                success: true,
                data: interviews
            });
        } catch (error) {
            console.error('Error fetching completed interviews for candidate:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch completed interviews'
            });
        }
    },

    // WebRTC handlers
    handleOffer: async (req, res) => {
        try {
            const { roomId } = req.params;
            const offer = req.body;

            const room = getRoomEmitter(roomId);
            room.offers.push(offer);
            room.emitter.emit('offer', offer);

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Offer error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    handleAnswer: async (req, res) => {
        try {
            const { roomId } = req.params;
            const answer = req.body;

            const room = getRoomEmitter(roomId);
            room.answers.push(answer);
            room.emitter.emit('answer', answer);

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Answer error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    handleIceCandidate: async (req, res) => {
        try {
            const { roomId } = req.params;
            const candidate = req.body;

            const room = getRoomEmitter(roomId);
            room.iceCandidates.push(candidate);
            room.emitter.emit('ice-candidate', candidate);

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('ICE candidate error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    handleEvents: async (req, res) => {
        try {
            const { roomId } = req.params;
            const room = getRoomEmitter(roomId);

            // Set headers for SSE
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            // Send initial room state
            res.write(`data: ${JSON.stringify({
                type: 'room-state',
                offers: room.offers,
                answers: room.answers,
                iceCandidates: room.iceCandidates
            })}\n\n`);

            // Handle new events
            const onOffer = (offer) => {
                res.write(`data: ${JSON.stringify({ type: 'offer', offer })}\n\n`);
            };

            const onAnswer = (answer) => {
                res.write(`data: ${JSON.stringify({ type: 'answer', answer })}\n\n`);
            };

            const onIceCandidate = (candidate) => {
                res.write(`data: ${JSON.stringify({ type: 'ice-candidate', candidate })}\n\n`);
            };

            // Register event listeners
            room.emitter.on('offer', onOffer);
            room.emitter.on('answer', onAnswer);
            room.emitter.on('ice-candidate', onIceCandidate);

            // Handle client disconnect
            req.on('close', () => {
                room.emitter.off('offer', onOffer);
                room.emitter.off('answer', onAnswer);
                room.emitter.off('ice-candidate', onIceCandidate);
            });
        } catch (error) {
            console.error('Events error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Get interview details
    getInterviewDetails: async (req, res) => {
        try {
            const { interviewId } = req.params;

            const interview = await Interview.findById(interviewId)
                .populate('candidateId', 'name email')
                .populate('interviewerId', 'name email expertise');

            if (!interview) {
                return res.status(404).json({
                    success: false,
                    message: 'Interview not found'
                });
            }

            // Verify the requesting user has access to this interview
            if (req.user._id.toString() !== interview.candidateId._id.toString() &&
                req.user._id.toString() !== interview.interviewerId._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            res.status(200).json({
                success: true,
                data: interview
            });
        } catch (error) {
            console.error('Error fetching interview details:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch interview details'
            });
        }
    },

    getInterviewerDashboard: async (req, res) => {
        try {
            const { interviewerId } = req.params;

            // Verify the requesting user is the interviewer
            if (req.user._id.toString() !== interviewerId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            // Fetch upcoming interviews
            const upcomingInterviews = await Interview.find({
                interviewerId,
                status: 'scheduled',
                scheduledTime: { $gt: new Date() }
            })
                .populate('candidateId', 'name email skills experience')
                .sort({ scheduledTime: 1 });

            // Fetch completed interviews
            const completedInterviews = await Interview.find({
                interviewerId,
                status: 'completed'
            })
                .populate('candidateId', 'name email skills experience')
                .sort({ scheduledTime: -1 });

            // Fetch available candidates
            const availableCandidates = await User.find({
                role: 'candidate',
                isActive: true
            })
                .select('name email skills experience')
                .sort({ name: 1 });

            // Calculate statistics
            const stats = {
                totalInterviews: completedInterviews.length,
                upcomingInterviews: upcomingInterviews.length,
                totalHours: completedInterviews.reduce((acc, curr) => acc + (curr.duration || 0), 0),
                averageScore: completedInterviews.length > 0
                    ? completedInterviews.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / completedInterviews.length
                    : 0
            };

            res.status(200).json({
                success: true,
                data: {
                    upcomingInterviews,
                    completedInterviews,
                    availableCandidates,
                    stats
                }
            });
        } catch (error) {
            console.error('Error fetching interviewer dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch interviewer dashboard data'
            });
        }
    },

    getInterviewerStats: async (req, res) => {
        try {
            const { interviewerId } = req.params;

            // Verify the requesting user is the interviewer
            if (req.user._id.toString() !== interviewerId) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized access'
                });
            }

            // Fetch all interviews for statistics
            const interviews = await Interview.find({
                interviewerId,
                status: 'completed'
            });

            // Calculate detailed statistics
            const stats = {
                totalInterviews: interviews.length,
                totalHours: interviews.reduce((acc, curr) => acc + (curr.duration || 0), 0),
                averageScore: interviews.length > 0
                    ? interviews.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / interviews.length
                    : 0,
                topics: {},
                skillDistribution: {},
                timeDistribution: {
                    morning: 0,
                    afternoon: 0,
                    evening: 0
                }
            };

            // Calculate topic and skill distribution
            interviews.forEach(interview => {
                // Topic distribution
                stats.topics[interview.topic] = (stats.topics[interview.topic] || 0) + 1;

                // Skill distribution from candidate
                if (interview.candidateId && interview.candidateId.skills) {
                    interview.candidateId.skills.forEach(skill => {
                        stats.skillDistribution[skill] = (stats.skillDistribution[skill] || 0) + 1;
                    });
                }

                // Time distribution
                const hour = new Date(interview.scheduledTime).getHours();
                if (hour >= 6 && hour < 12) stats.timeDistribution.morning++;
                else if (hour >= 12 && hour < 17) stats.timeDistribution.afternoon++;
                else stats.timeDistribution.evening++;
            });

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching interviewer stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch interviewer statistics'
            });
        }
    }
};

module.exports = interviewController; 
