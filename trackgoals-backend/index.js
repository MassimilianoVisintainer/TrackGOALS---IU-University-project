const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


const app = express(); // Creates an Express application instance.
app.use(cors()); // Enables CORS for all routes, allowing requests from any origin.
app.use(express.json()); // Middleware to parse incoming JSON payloads in request bodies. This makes `req.body` available.

// MongoDB Connection Setup
const client = new MongoClient(process.env.MONGODB_URI); // Creates a new MongoClient instance using the MongoDB connection URI from environment variables.
const db = client.db("TrackGoalsDB"); // Specifies the database to connect to.
const users = db.collection("users"); // Specifies the 'users' collection within the database.
const habits = db.collection("habits"); // Specifies the 'habits' collection within the database.
const goals = db.collection("goals"); // Add this with the other collections

/**
 * Asynchronously connects to the MongoDB database.
 * Logs a success message or an error if the connection fails.
 */
async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectDB(); // Calls the function to connect to the database when the server starts.


/**
 * POST /api/signup
 * Handles user registration.
 * Expects 'name', 'email', and 'password' in the request body.
 */
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body; // Destructures name, email, and password from the request body.

  // Checks if all required fields are provided.
  if (!(name && email && password)) {
    return res.status(400).json({ message: "All fields are required." }); // Returns a 400 Bad Request if fields are missing.
  }

  try {
    // Checks if a user with the provided email already exists in the database.
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." }); // Returns a 409 Conflict if email is already registered.
    }

    // Hashes the password using bcrypt for security before storing it.
    const hashedPassword = await bcrypt.hash(password, 10);
    // Inserts the new user into the 'users' collection with the hashed password.
    await users.insertOne({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully." }); // Returns a 201 Created status on successful registration.
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * POST /api/login
 * Handles user authentication.
 * Expects 'email' and 'password' in the request body.
 */
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body; // Destructures email and password from the request body.

  // Checks if both email and password are provided.
  if (!(email && password)) {
    return res.status(400).json({ message: "All fields are required." }); // Returns a 400 Bad Request if fields are missing.
  }

  try {
    // Finds a user in the database by their email.
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." }); // Returns a 404 Not Found if no user with that email exists.
    }

    // Compares the provided plain-text password with the stored hashed password.
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password." }); // Returns a 401 Unauthorized if passwords do not match.
    }

    // Create JWT token
    // Generates a JSON Web Token (JWT) upon successful authentication.
    const token = jwt.sign(
      { userId: user._id, email: user.email }, // Payload: Data to be encoded in the token (user ID and email).
      process.env.JWT_SECRET, // Secret key used to sign the token, loaded from environment variables.
      { expiresIn: "1h" } // Token expiration time.
    );

    // Returns a 200 OK status, a success message, and the generated JWT.
    res.status(200).json({ message: "Login successful.", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * GET /api/protected
 */
app.get("/api/protected", (req, res) => {
  // Extracts the Authorization header from the incoming request.
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided." }); // Returns 401 if Authorization header is missing.
  }

  // Extracts the JWT token from the "Bearer <token>" format.
  const token = authHeader.split(" ")[1];

  try {
    // Verifies the token using the JWT_SECRET.
    // If successful, 'decoded' will contain the original payload ({ userId, email }).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // If the token is valid, returns a success message and the decoded user information.
    res.status(200).json({ message: "Protected content", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid token." });
  }
});

app.post("/api/habits", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const { name, description, frequency } = req.body;
  if (!name || !frequency)
    return res.status(400).json({ message: "Missing fields." });

  try {
    const newHabit = {
      userId: decoded.userId,
      name,
      description,
      frequency,
      createdAt: new Date(),
      completedDates: [],
    };
    const result = await habits.insertOne(newHabit);
    res.status(201).json(result.ops?.[0] || newHabit);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

app.get("/api/habits", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  try {
    const userHabits = await habits.find({ userId: decoded.userId }).toArray();
    res.status(200).json(userHabits);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

const { ObjectId } = require("mongodb");

app.patch("/api/habits/:id/complete", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const habitId = req.params.id;

  try {
    const result = await habits.updateOne(
      { _id: new ObjectId(habitId), userId: decoded.userId },
      { $addToSet: { completedDates: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Habit not found or not yours." });
    }

    res.status(200).json({ message: "Habit marked as completed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

app.delete("/api/habits/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const habitId = req.params.id;

  try {
    await habits.deleteOne({
      _id: new ObjectId(habitId),
      userId: decoded.userId,
    });
    res.status(200).json({ message: "Habit deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

app.post("/api/goals", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const { title, startDate, endDate } = req.body;

  if (!title || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Title, start date, and end date are required." });
  }

  try {
    const newGoal = {
      userId: decoded.userId,
      title: title.trim(),
      description: req.body.description?.trim() || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      completed: false,
      progress: 0,
      createdAt: new Date(),
    };

    const result = await goals.insertOne(newGoal);
    res.status(201).json(result.ops?.[0] || newGoal);
  } catch (err) {
    console.error("Goal creation error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

app.get("/api/goals", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  try {
    const userGoals = await goals.find({ userId: decoded.userId }).toArray();
    res.status(200).json(userGoals);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

app.put("/api/goals/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const goalId = req.params.id;
  const { title, description, startDate, endDate, progress } = req.body;

  if (!title || !startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Title, start date, and end date are required." });
  }

  try {
    const result = await goals.updateOne(
      { _id: new ObjectId(goalId), userId: decoded.userId },
      {
        $set: {
          title: title.trim(),
          description: description?.trim() || "",
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          progress: progress ?? 0,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Goal not found or not yours." });
    }

    res.status(200).json({ message: "Goal updated successfully." });
  } catch (err) {
    console.error("Goal update error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

app.delete("/api/goals/:id", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const goalId = req.params.id;

  try {
    const result = await goals.deleteOne({
      _id: new ObjectId(goalId),
      userId: decoded.userId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Goal not found or not yours." });
    }

    res.status(200).json({ message: "Goal deleted successfully." });
  } catch (err) {
    console.error("Goal deletion error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

app.patch("/api/goals/:id/complete", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const goalId = req.params.id;

  try {
    const result = await goals.updateOne(
      { _id: new ObjectId(goalId), userId: decoded.userId },
      { $set: { completed: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Goal not found or not yours." });
    }

    res.status(200).json({ message: "Goal marked as completed." });
  } catch (err) {
    console.error("Goal completion error:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// Define the /api/dashboard endpoint to return user-specific dashboard stats
app.get("/api/dashboard", async (req, res) => {
  // Check for the Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided." });

  // Extract the JWT token from the "Bearer <token>" format
  const token = authHeader.split(" ")[1];
  let decoded;

  // Verify the token using JWT_SECRET; return 401 if invalid
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  try {
    const userId = decoded.userId; // Extract the user's ID from the decoded token

    // Parse the optional startDate and endDate query parameters
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // Default to 7 days ago
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date(); // Default to today

    // Generate all dates in the specified range (formatted as YYYY-MM-DD)
    const dateRange = [];
    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      dateRange.push(cursor.toISOString().split("T")[0]);
      cursor.setDate(cursor.getDate() + 1); // Move to next day
    }

    // Fetch the user's habits and goals concurrently from MongoDB
    const [userHabits, userGoals] = await Promise.all([
      habits.find({ userId }).toArray(),
      goals.find({ userId }).toArray(),
    ]);

    // Count total habits and goals
    const totalHabits = userHabits.length;
    const totalGoals = userGoals.length;

    // Compute progress for each goal (based on elapsed time in range)
    const goalsProgress = userGoals.map((goal) => {
      const start = new Date(goal.startDate);
      const end = new Date(goal.endDate);
      const now = new Date();

      const totalDuration = end - start;
      const elapsed = now - start;

      // Clamp progress between 0% and 100%
      const progress = Math.max(
        0,
        Math.min(100, Math.round((elapsed / totalDuration) * 100))
      );

      return {
        goalName: goal.title,
        progress,
        completed: goal.completed || false,
      };
    });

    // Build chart data for habit completions over date range
    const habitCompletionChartData = dateRange.map((date) => {
      const completed = userHabits.reduce((count, habit) => {
        const completions = habit.completedDates || [];
        const dateStrings = completions.map((d) =>
          new Date(d).toISOString().split("T")[0]
        );
        return count + (dateStrings.includes(date) ? 1 : 0);
      }, 0);

      return { date, completed }; // Format: { date: 'YYYY-MM-DD', completed: number }
    });

    // Sum total completions over selected period
    const habitsCompleted = habitCompletionChartData.reduce(
      (sum, day) => sum + day.completed,
      0
    );

    // Send the dashboard response to the client
    res.status(200).json({
      totalHabits,
      totalGoals,
      habitsCompletedInRange: habitsCompleted,
      goalsProgress,
      habitCompletionChartData,
    });
  } catch (err) {
    console.error("Dashboard error:", err); // Log server-side errors
    res.status(500).json({ message: "Server error." }); // Send generic error to client
  }
});


// Defines the port for the server to listen on.
const PORT = process.env.PORT || 5000;
// Starts the Express server.
// '0.0.0.0' makes the server listen on all available network interfaces,
// which is useful in containerized environments (like Docker) or if you want to access it from other machines on the same network.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
