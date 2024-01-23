const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { getDatabaseInstance } = require("./config/db");
const dbInstance = getDatabaseInstance();
const User = require('./models/userModel');

//cache variables
var productss = []
var carts = []


const app = express();
const port = 4000;
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with the actual URL of your Next.js frontend
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to authenticate the user
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(token)
  if (!token) {
    return res.status(401).json({status:'error', msg: 'Unauthorized: No token provided' });
  }

  jwt.verify(token.split(' ')[1], 'john', (err, user) => {
    if (err) {
      return res.status(403).json({status:'error', msg: 'Forbidden: Invalid token' });
    }

    req.user = user;
    next();
  });
};

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.json({status:'success', msg: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({status:'error', msg: 'Error creating user' });
  }
});

// Signin route
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body)
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(404).json({status:'error', msg: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({status:'error', msg: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, 'john', { expiresIn: '1h' });

    res.json({msg:'success', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({status:'error', msg: 'Error signing in' });
  }
});

// Protected route for products
app.get('/products', authenticateUser, async (req, res) => {
  try {
    // Fetch data from dummyjson.com or your database
    if(productss.length == 0){
    const response = await fetch('https://dummyjson.com/products');
    const data = await response.json();
      productss = data.products
    }
    res.json(productss);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ status:'error',msg: 'Error fetching products' });
  }
});

// Protected route for cart
app.get('/cart', authenticateUser, async (req, res) => {
  try {
    if(carts.length == 0){

      const response = await fetch(`https://dummyjson.com/carts`);
      const data = await response.json();
      carts = data;
    }

    // Fetch data from dummyjson.com or your database using the userId

    res.json(carts);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({status:'error', msg: 'Error fetching cart' });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
