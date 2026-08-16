const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrow: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow', required: true },
    amount: { type: Number, required: true, default: 0 },
    daysLate: { type: Number, default: 0 },
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    paidDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fine', fineSchema);
