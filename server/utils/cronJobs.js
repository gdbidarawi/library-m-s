const cron = require('node-cron');
const Borrow = require('../models/Borrow');
const Notification = require('../models/Notification');

// Runs every day at midnight: marks overdue issued books + sends due-date reminders
const startCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();

      // Mark overdue
      const overdue = await Borrow.find({ status: 'issued', dueDate: { $lt: now } });
      for (const b of overdue) {
        b.status = 'overdue';
        await b.save();
      }

      // Reminders for books due in the next 2 days
      const soon = new Date();
      soon.setDate(soon.getDate() + 2);
      const dueSoon = await Borrow.find({
        status: 'issued',
        dueDate: { $gte: now, $lte: soon },
      }).populate('book', 'title');

      for (const b of dueSoon) {
        await Notification.create({
          user: b.student,
          title: 'Due Date Reminder',
          message: `"${b.book.title}" is due on ${b.dueDate.toDateString()}. Please return or renew it soon.`,
          type: 'due',
        });
      }

      console.log(`[CRON] Overdue check complete. ${overdue.length} marked overdue, ${dueSoon.length} reminders sent.`);
    } catch (err) {
      console.error('[CRON] Error running overdue job:', err.message);
    }
  });
};

module.exports = startCronJobs;
