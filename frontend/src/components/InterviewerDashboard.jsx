import { useEffect, useState } from "react";
import axios from "axios";
import qualifiedCandidatesData from "../data/qualified_candidates.json";
import interviewsData from "../data/interviewsData.json";

const InterviewerDashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [qualifiedCandidates, setQualifiedCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isInviteFormOpen, setIsInviteFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    receiverEmail: "",
    candidateName: "",
    interviewerName: "John Doe",
    roomLink: "",
    interviewTime: "",
    message: "",
  });

  // Fetch data on component load
  useEffect(() => {
    fetchInterviews();
    setQualifiedCandidates(qualifiedCandidatesData);
  }, []);

  // Fetch Interviews from Mock or API
  const fetchInterviews = async () => {
    try {
      setInterviews(interviewsData);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
  };

  // Create New Interview
  const handleCreateInterview = async () => {
    if (!scheduledDate) {
      alert("Please select a date!");
      return;
    }

    try {
      const newInterview = {
        id: interviews.length + 1,
        date: scheduledDate,
        status: "Scheduled",
      };

      setInterviews([...interviews, newInterview]);
      alert("Interview created successfully!");
      setScheduledDate("");
    } catch (error) {
      console.error("Error creating interview:", error);
      alert("Failed to create interview.");
    }
  };

  // Open Invite Form with Pre-filled Data
  const handleOpenInviteForm = (interviewId) => {
    if (!selectedCandidate) {
      alert("Please select a candidate first!");
      return;
    }

    setFormData({
      receiverEmail: maskEmail(selectedCandidate.email),
      candidateName: selectedCandidate.name,
      interviewerName: "John Doe", // Set dynamically if needed
      roomLink: `https://example.com/interview/${interviewId}`,
      interviewTime: new Date().toLocaleString(),
      message: `Hello ${selectedCandidate.name}, you have been invited to an interview with John Doe.`,
    });

    setIsInviteFormOpen(true);
  };

  // Mask email for security
  const maskEmail = (email) => {
    const [localPart, domain] = email.split("@");
    if (localPart.length > 3) {
      const maskedLocal = `${localPart.slice(0, 2)}****${localPart.slice(-2)}`;
      return `${maskedLocal}@${domain}`;
    }
    return email;
  };

  // ✅ Send Email Invitation using Correct Payload and Error Handling
  const sendEmail = async () => {
    if (
      !formData.receiverEmail ||
      !formData.roomLink ||
      !formData.interviewTime
    ) {
      alert("Please fill all fields before sending the email.");
      return;
    }

    const payload = {
      receiverEmail: selectedCandidate.email, // ✅ Send actual email, not masked
      candidateName: formData.candidateName,
      interviewerName: formData.interviewerName,
      roomLink: formData.roomLink,
      interviewTime: formData.interviewTime,
      message: formData.message,
    };


    try {
      console.log("Payload", payload);
      const response = await axios.post(
        "http://localhost:5000/api/email/send",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response", response);

      if (response.data.success) {
        alert("Email sent successfully!");
        setIsInviteFormOpen(false);
      } else {
        alert("Failed to send email.");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      alert("Failed to send email. Try again later.");
    }
  };

  // Start Interview
  const handleStartInterview = async (interviewId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/interviews/${interviewId}/start`
      );
      alert("Interview started!");

      // Update status locally
      setInterviews((prev) =>
        prev.map((interview) =>
          interview.id === interviewId
            ? { ...interview, status: "In Progress" }
            : interview
        )
      );
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Interviewer Dashboard</h2>

      {/* Qualified Candidates Section */}
      <div className="mb-6">
        <select
          className="w-full border p-2 rounded"
          onChange={(e) => {
            const candidate = qualifiedCandidates.find(
              (c) => c.id === parseInt(e.target.value)
            );
            setSelectedCandidate(candidate);
          }}
        >
          <option value="">Select Candidate</option>
          {qualifiedCandidates.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedule Interview Section */}
      <div className="mb-6">
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleCreateInterview}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Schedule Interview
        </button>
      </div>

      {/* Scheduled Interviews Section */}
      <div>
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between">
              <div>{new Date(interview.date).toLocaleString()}</div>
              <div>
                <button
                  onClick={() => handleStartInterview(interview.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Start
                </button>
                <button
                  onClick={() => handleOpenInviteForm(interview.id)}
                  className="bg-purple-500 text-white px-4 py-2 rounded ml-2"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Form */}
      {isInviteFormOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Send Invitation</h3>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
            <button
              onClick={sendEmail}
              className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2"
            >
              Send Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewerDashboard;
