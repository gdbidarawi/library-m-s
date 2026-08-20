const User = require('../models/User');
const Borrow = require('../models/Borrow');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all users (students by default, filterable by role)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { search, role = 'student', page = 1, limit = 10 } = req.query;
  const query = { role };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { registrationNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    users,
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, user });
});

// @desc    Admin creates a new student
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, department, phone, address, registrationNumber, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password: password || 'Library@123', // default password if not provided
    department,
    phone,
    address,
    registrationNumber,
    role: role || 'student',
    isVerified: true, // admin-created accounts are pre-verified
  });

  res.status(201).json({
    success: true,
    user: { ...user.toObject(), password: undefined },
  });
});

// @desc    Update user/student
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, address, department, registrationNumber, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, phone, address, department, registrationNumber, isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.status(200).json({ success: true, user });
});

// @desc    Delete user/student
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const activeBorrows = await Borrow.countDocuments({
    student: user._id,
    status: { $in: ['issued', 'approved', 'pending'] },
  });

  if (activeBorrows > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete student with active or pending borrow records',
    });
  }

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
