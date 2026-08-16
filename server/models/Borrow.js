const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    requestDate: { type: Date, default: Date.now },
    issueDate: { type: Date },
    dueDate: { type: Date },
    returnDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'issued', 'returned', 'cancelled', 'overdue'],
      default: 'pending',
    },
    renewCount: { type: Number, default: 0 },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Borrow', borrowSchema);
