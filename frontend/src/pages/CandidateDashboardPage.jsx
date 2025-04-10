import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import interviewAPI from '../services/interviewAPI';

const CandidateDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    upcomingInterviews: [],
    completedInterviews: [],
    stats: {
      completedInterviews: 0,
      upcomingInterviews: 0,
      totalInterviews: 0,
      averageScore: 0,
    },
  });

  useEffect(() => {
    if (user?.id) {
      const fetchInterviews = async () => {
        try {
          setLoading(true);
          
          // Fetch upcoming interviews
          const upcomingResponse = await interviewAPI.getUpcomingInterviews(user.id);
          const upcoming = upcomingResponse.data;
          
          // Fetch completed interviews
          const completedResponse = await interviewAPI.getCompletedInterviews(user.id);
          const completed = completedResponse.data;

          const averageScore = completed.length > 0
            ? completed.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / completed.length
            : 0;

          setDashboardData({
            upcomingInterviews: upcoming,
            completedInterviews: completed,
            stats: {
              completedInterviews: completed.length,
              upcomingInterviews: upcoming.length,
              totalInterviews: upcoming.length + completed.length,
              averageScore: averageScore,
            },
          });
        } catch (error) {
          console.error('Error fetching interviews:', error);
          toast.error('Failed to load interviews');
        } finally {
          setLoading(false);
        }
      };

      fetchInterviews();
    }
  }, [user]);

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
      {/* Render your component content here */}
    </div>
  );
};

export default CandidateDashboardPage; 