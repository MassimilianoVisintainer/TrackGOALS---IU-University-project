const cron = require('node-cron');
const User = require('../models/User');
const Habit = require('../models/Habit');
const { sendReminderEmail } = require('../utils/emailReminder');

const dailyReminderJob = cron.schedule('0 8 * * *', async () => {
  console.log('Running daily reminder job at 8:00 AM...');

  const users = await User.find();

  for (const user of users) {
    const habits = await Habit.find({ userId: user._id });

    const pendingHabits = habits.filter(habit => {
      const today = new Date();
      return !habit.completedDates.some(date => {
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
      });
    });

    if (pendingHabits.length > 0) {
      const habitNames = pendingHabits.map(h => `- ${h.name}`).join('\n');
      const message = `Hello ${user.username},\n\nYou have some habits to complete today:\n${habitNames}\n\nStay consistent!`;
      await sendReminderEmail(user.email, 'TrackGOALS - Daily Habit Reminder', message);
    }
  }
});

module.exports = dailyReminderJob;
