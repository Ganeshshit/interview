const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['interviewer', 'candidate'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  skills: [{
    type: String
  }],
  experience: {
    type: String,
    required: true
  },
  preferredRole: {
    type: String
  },
  level: {
    type: String,
    enum: ['junior', 'mid-level', 'senior']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  profileImage: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  availability: [{
    date: Date,
    slots: [String]
  }],
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate auth token
userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
};

// Find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  try {
    console.log('Finding user with email:', email);
    const user = await this.findOne({ email });
    
    if (!user) {
      console.log('No user found with email:', email);
      throw new Error('Invalid login credentials');
    }
    
    console.log('User found, comparing passwords');
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      throw new Error('Invalid login credentials');
    }
    
    console.log('Credentials valid for user:', email);
    return user;
  } catch (error) {
    console.error('Error in findByCredentials:', error);
    throw error;
  }
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  
  delete userObject.password;
  delete userObject.tokens;
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 