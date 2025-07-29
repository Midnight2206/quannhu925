const mongoose = require('mongoose');

const increaseTemporarySaveSchema = new mongoose.Schema({
  info: {
    fullName: String,
    gender: String,
    rank: String,
    unit: String,
    PHCDD: String,
    lotteryNumber: String,
  },
  size: {
    uniform: String,
    hat: String,
    shoe: String,
    mat: String,
    duaration: String,
  },
  otherInfo: {
    tranferFrom: String,
    moveInTime: String,
    fromAnyYear: String,
    bookSubmitter: String,
    dateOfSubmission: String,
  },
}, { timestamps: true });

const increaseTemporarySave = mongoose.model('increaseTemporarySave', increaseTemporarySaveSchema);

module.exports = increaseTemporarySave;