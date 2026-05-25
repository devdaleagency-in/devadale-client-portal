const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: String,
  progress: Number
}, {
  timestamps: true
})

module.exports = mongoose.model('Project', ProjectSchema)