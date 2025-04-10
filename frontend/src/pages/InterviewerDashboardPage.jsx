import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import interviewAPI from '../services/interviewAPI';

const InterviewerDashboardPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    upcomingInterviews: [],
    stats: {
      upcomingInterviews: 0
    }
  });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleScheduleInterview = async (formData) => {
    try {
      setLoading(true);

      // Find candidate from your existing data structure
      const candidate = candidates.find(c => c.id === selectedCandidate.id);
      
      if (!candidate) {
        throw new Error('Candidate not found');
      }

      // Prepare interview data
      const interviewData = {
        candidateId: candidate.id,
        candidateEmail: candidate.email,
        scheduledTime: formData.scheduledTime,
        duration: formData.duration,
        topic: formData.topic,
        message: formData.message
      };

      // Schedule interview using API
      const response = await interviewAPI.scheduleInterview(interviewData);

      // Update dashboard data
      setDashboardData(prev => ({
        ...prev,
        upcomingInterviews: [...prev.upcomingInterviews, response.data],
        stats: {
          ...prev.stats,
          upcomingInterviews: prev.stats.upcomingInterviews + 1
        }
      }));

      toast.success('Interview scheduled successfully!');
      setIsScheduleModalOpen(false);
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error(error.message || 'Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinInterview = async (interview) => {
    try {
      // Verify access to interview room
      await interviewAPI.joinInterview(interview.roomId);
      
      // Navigate to interview page
      navigate(`/interview/${interview.roomId}`);
    } catch (error) {
      console.error('Error joining interview:', error);
      toast.error('Failed to join interview. Please try again.');
    }
  };

  return (
    <div>
      {/* Rest of the component code */}
    </div>
  );
};

export default InterviewerDashboardPage; 