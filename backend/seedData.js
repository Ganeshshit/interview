const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find and update user
    const updatedUser = await User.findOneAndUpdate(
      { email: 'kartickshit2@gmail.com' },
      {
        name: 'Kartick Shit',
        password: await bcrypt.hash('password123', 8),
        role: 'candidate',
        department: 'Product',
        skills: ['AWS', 'SQL'],
        experience: '1 years',
        preferredRole: 'Frontend Developer',
        level: 'junior',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User10',
        status: 'active',
        totalInterviews: 17,
        rating: 4.5,
        availability: [
          {
            date: new Date('2025-05-01T18:13:40.026Z'),
            slots: ['09:00', '09:00', '16:00']
          },
          {
            date: new Date('2025-04-13T11:59:14.272Z'),
            slots: ['16:00', '10:00', '14:00']
          },
          {
            date: new Date('2025-04-08T11:23:32.745Z'),
            slots: ['11:00', '11:00', '14:00']
          },
          {
            date: new Date('2025-04-25T00:04:00.579Z'),
            slots: ['09:00', '09:00', '10:00']
          },
          {
            date: new Date('2025-05-01T10:17:43.479Z'),
            slots: ['11:00', '16:00', '14:00']
          }
        ]
      },
      { new: true }
    );

    if (updatedUser) {
      console.log('User updated successfully');
    } else {
      console.log('User not found');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating user:', error);
    process.exit(1);
  }
};

seedData(); 