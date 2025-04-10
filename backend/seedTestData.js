const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas based on existing models
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  profileImage: String,
  expertise: [String],
  interviewLevels: [String],
  created_at: Date,
  status: String,
  department: String,
  totalInterviews: Number,
  rating: Number,
  availability: [{
    date: Date,
    slots: [String]
  }],
  skills: [String],
  experience: String,
  preferredRole: String,
  level: String
});

const interviewSchema = new mongoose.Schema({
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  feedback: {
    rating: Number,
    comments: String
  }
}, {
  timestamps: true
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  starterCode: {
    type: String,
    default: ''
  },
  testCases: [{
    input: String,
    output: String,
    explanation: String
  }],
  solution: {
    type: String
  },
  hints: [{
    type: String
  }],
  timeLimit: {
    type: Number,
    default: 60
  }
}, {
  timestamps: true
});

const callSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  hostId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  },
  participants: [{
    userId: String,
    role: String,
    joinedAt: Date
  }],
  messages: [{
    sender: String,
    content: String,
    timestamp: Date
  }],
  recording: {
    isActive: Boolean,
    startedAt: Date,
    endedAt: Date,
    url: String
  },
  quality: {
    rtt: Number,
    packetLoss: Number,
    bandwidth: Number,
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date
});

// Create models
const User = mongoose.model('User', userSchema);
const Interview = mongoose.model('Interview', interviewSchema);
const Question = mongoose.model('Question', questionSchema);
const Call = mongoose.model('Call', callSchema);

// Helper functions to generate random data
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomDate = () => new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000);
const getRandomTimeSlot = () => {
  const hours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  return getRandomElement(hours);
};

// Generate random test data
const generateTestData = () => {
  const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];
  const roles = ['interviewer', 'candidate'];
  const levels = ['junior', 'mid-level', 'senior'];
  const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Kubernetes'];
  const platforms = ['Zoom', 'Google Meet', 'Microsoft Teams'];
  const difficulties = ['easy', 'medium', 'hard'];
  const categories = ['Array', 'String', 'Tree', 'Graph', 'Dynamic Programming', 'System Design'];

  // Generate random users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const role = getRandomElement(roles);
    const user = {
      name: `Test User ${i}`,
      email: `test${i}@example.com`,
      password: 'password123',
      role,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`,
      created_at: new Date(),
      status: 'active',
      department: getRandomElement(departments),
      totalInterviews: Math.floor(Math.random() * 50),
      rating: (Math.random() * 2 + 3).toFixed(1),
      availability: Array(5).fill(null).map(() => ({
        date: getRandomDate(),
        slots: Array(3).fill(null).map(() => getRandomTimeSlot())
      }))
    };

    if (role === 'interviewer') {
      user.expertise = Array(3).fill(null).map(() => getRandomElement(skills));
      user.interviewLevels = Array(2).fill(null).map(() => getRandomElement(levels));
    } else {
      user.skills = Array(3).fill(null).map(() => getRandomElement(skills));
      user.experience = `${Math.floor(Math.random() * 10)} years`;
      user.preferredRole = getRandomElement(['Frontend Developer', 'Backend Developer', 'Full Stack Developer']);
      user.level = getRandomElement(levels);
    }

    users.push(user);
  }

  // Generate random interviews
  const interviews = [];
  for (let i = 1; i <= 15; i++) {
    const interview = {
      interviewerId: new mongoose.Types.ObjectId(), // Will be replaced with actual user IDs
      candidateId: new mongoose.Types.ObjectId(), // Will be replaced with actual user IDs
      scheduledTime: getRandomDate(),
      duration: 60,
      topic: getRandomElement(skills),
      roomId: `room-${2024}${String(i).padStart(3, '0')}`,
      meetingLink: `https://meet.example.com/room${i}`,
      status: getRandomElement(['scheduled', 'completed', 'cancelled'])
    };

    if (interview.status === 'completed') {
      interview.feedback = {
        rating: (Math.random() * 2 + 3).toFixed(1),
        comments: 'Good performance overall'
      };
    }

    interviews.push(interview);
  }

  // Generate random questions
  const questions = [];
  for (let i = 1; i <= 10; i++) {
    const category = getRandomElement(categories);
    questions.push({
      title: `${category} Problem ${i}`,
      description: `This is a test coding question about ${category.toLowerCase()}`,
      difficulty: getRandomElement(difficulties),
      category,
      starterCode: `function solve${category}Problem() {\n  // Your code here\n}`,
      testCases: Array(2).fill(null).map((_, index) => ({
        input: `input${index + 1}`,
        output: `output${index + 1}`,
        explanation: `This is explanation ${index + 1}`
      })),
      solution: `function solve${category}Problem() {\n  // Solution here\n}`,
      hints: ['Hint 1', 'Hint 2'],
      timeLimit: 60
    });
  }

  // Generate random calls
  const calls = [];
  for (let i = 1; i <= 5; i++) {
    calls.push({
      roomId: `call-${2024}${String(i).padStart(3, '0')}`,
      hostId: new mongoose.Types.ObjectId(), // Will be replaced with actual user IDs
      status: getRandomElement(['waiting', 'active', 'ended']),
      participants: Array(2).fill(null).map(() => ({
        userId: new mongoose.Types.ObjectId(),
        role: getRandomElement(['interviewer', 'candidate']),
        joinedAt: new Date()
      })),
      messages: Array(5).fill(null).map((_, index) => ({
        sender: `User${index + 1}`,
        content: `Test message ${index + 1}`,
        timestamp: new Date()
      })),
      recording: {
        isActive: Math.random() > 0.5,
        startedAt: new Date(),
        endedAt: new Date(),
        url: `https://recording.example.com/call-${i}`
      },
      quality: {
        rtt: Math.floor(Math.random() * 100),
        packetLoss: Math.random() * 5,
        bandwidth: Math.floor(Math.random() * 1000) + 500,
        timestamp: new Date()
      },
      createdAt: new Date(),
      endedAt: new Date()
    });
  }

  return { users, interviews, questions, calls };
};

// Connect to MongoDB and seed data
mongoose.connect('mongodb+srv://ganesh:Ganesh123@cluster0.crfhb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Interview.deleteMany({}),
      Question.deleteMany({}),
      Call.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Generate and insert test data
    const { users, interviews, questions, calls } = generateTestData();

    // Insert users first to get their IDs
    const insertedUsers = await User.insertMany(users);
    console.log('Inserted users');

    // Update interviews with actual user IDs
    const updatedInterviews = interviews.map(interview => ({
      ...interview,
      interviewerId: insertedUsers[Math.floor(Math.random() * insertedUsers.length)]._id,
      candidateId: insertedUsers[Math.floor(Math.random() * insertedUsers.length)]._id
    }));

    // Insert interviews
    await Interview.insertMany(updatedInterviews);
    console.log('Inserted interviews');

    // Insert questions
    await Question.insertMany(questions);
    console.log('Inserted questions');

    // Update calls with actual user IDs
    const updatedCalls = calls.map(call => ({
      ...call,
      hostId: insertedUsers[Math.floor(Math.random() * insertedUsers.length)]._id,
      participants: call.participants.map(participant => ({
        ...participant,
        userId: insertedUsers[Math.floor(Math.random() * insertedUsers.length)]._id
      }))
    }));

    // Insert calls
    await Call.insertMany(updatedCalls);
    console.log('Inserted calls');

    console.log('Test data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
})
.catch(error => {
  console.error('MongoDB connection error:', error);
}); 