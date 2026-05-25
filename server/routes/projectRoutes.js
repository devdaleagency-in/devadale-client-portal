const express = require('express')
const router = express.Router()

const Project = require('../models/Project')

// GET all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
    res.json(projects)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// CREATE new project
router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body)
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router