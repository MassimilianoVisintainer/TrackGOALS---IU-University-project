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
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const { name, description, frequency } = req.body;
  if (!name || !frequency) return res.status(400).json({ message: "Missing fields." });

  try {
    const newHabit = {
      userId: decoded.userId,
      name,
      description,
      frequency,
      createdAt: new Date(),
      completedDates: []
    };
    const result = await habits.insertOne(newHabit);
    res.status(201).json(result.ops?.[0] || newHabit);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

app.get("/api/habits", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

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
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

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
  if (!authHeader) return res.status(401).json({ message: "No token provided." });

  const token = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }

  const habitId = req.params.id;

  try {
    await habits.deleteOne({ _id: new ObjectId(habitId), userId: decoded.userId });
    res.status(200).json({ message: "Habit deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});


// Defines the port for the server to listen on.
const PORT = process.env.PORT || 5000;
// Starts the Express server.
// '0.0.0.0' makes the server listen on all available network interfaces,
// which is useful in containerized environments (like Docker) or if you want to access it from other machines on the same network.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`); 
});