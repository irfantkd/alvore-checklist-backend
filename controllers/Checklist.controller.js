const { default: mongoose } = require("mongoose");
const Checklist = require("../models/Checklist.model"); // Adjust the path as needed
const UserModel = require("../models/User.model"); // Import the User model

// Create a new checklist
const createChecklist = async (req, res) => {
  try {
    const { title, questions, userid } = req.body;
    const userobjid = new mongoose.Types.ObjectId(userid);
    // Verify the user is an admin
    const user = await UserModel.findById(userobjid);
    if (!user || user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can create checklists." });
    }

    const checklist = new Checklist({
      title,
      questions,
      createdBy: userid,
    });
    await checklist.save();

    res
      .status(201)
      .json({ message: "Checklist created successfully", checklist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating checklist", error: error.message });
  }
};

// Get all checklists
const getAllChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find()
      .populate("createdBy", "firstname lastname role")
      .exec();

    res.status(200).json(checklists);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching checklists", error: error.message });
  }
};

// Get a checklist by ID
const getChecklistById = async (req, res) => {
  try {
    const { id } = req.params;
    const objid = new mongoose.Types.ObjectId(id);

    const checklist = await Checklist.findById(objid)
      .populate("createdBy", "firstname lastname role")
      .exec();

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    res.status(200).json(checklist);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching checklist", error: error.message });
  }
};
// Get ChecklistForDriver
const getChecklistForDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { userid } = req.body;
    const userobjid = new mongoose.Types.ObjectId(userid);
    // Verify that the driver exists
    const driver = await UserModel.findById(userobjid);
    if (!driver || driver.role !== "driver") {
      return res
        .status(403)
        .json({ message: "Only drivers can view checklists." });
    }

    // Fetch the checklist
    const checklist = await Checklist.findById(id);

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found." });
    }

    res.status(200).json({ checklist });
  } catch (error) {
    res.status(500).json({ message: "Error fetching checklist", error });
  }
};

// Update a checklist
const updateChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions } = req.body;

    const checklist = await Checklist.findByIdAndUpdate(
      id,
      { title, questions },
      { new: true, runValidators: true }
    );

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    res
      .status(200)
      .json({ message: "Checklist updated successfully", checklist });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating checklist", error: error.message });
  }
};

// Delete a checklist
const deleteChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await Checklist.findByIdAndDelete(id);

    if (!checklist) {
      return res.status(404).json({ message: "Checklist not found" });
    }

    res.status(200).json({ message: "Checklist deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting checklist", error: error.message });
  }
};

module.exports = {
  createChecklist,
  getAllChecklists,
  getChecklistById,
  updateChecklist,
  deleteChecklist,
  getChecklistForDriver,
};
