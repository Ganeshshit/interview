import VideoCall from '../components/VideoCall';
import CodeEditor from '../components/CodeEditor';
import Chat from '../components/Chat';

const InterviewPage = ({ roomId, isInterviewer }) => {
    return (
        <div>
            <VideoCall roomId={roomId} isInterviewer={isInterviewer} />
            <CodeEditor onCodeChange={(code) => console.log(code)} />
            <Chat roomId={roomId} />
        </div>
    );
};

export default InterviewPage;
