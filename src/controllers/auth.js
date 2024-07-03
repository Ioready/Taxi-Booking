const db = require('../db')
const { hash, compare } = require('bcryptjs')
const { sign, verify } = require('jsonwebtoken')
const { SECRET } = require('../constants')



exports.getUserByToken = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify and decode the token
    const decoded = verify(token, SECRET);
    const { id } = decoded;

    // Query the database for user details
    const result = await db.query(
      'SELECT user_id, username, email, whatsapp_number, licence_no, profile_picture, licence_picture, role FROM users WHERE user_id = $1',
      [id]
    );

    // Check if user is found
    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        User: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const { rows } = await db.query('select user_id, username, email, whatsapp_number, licence_no, profile_picture, licence_picture, role from users')

    return res.status(200).json({
      success: true,
      users: rows,
    })
  } catch (error) {
    console.log(error.message)
  }
}

// Get User By ID

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'select user_id, username, email, whatsapp_number, licence_no, profile_picture, licence_picture, role from users WHERE user_id = $1',
      [id]
    );

    if (result.rowCount === 1) {
      return res.status(200).json({
        success: true,
        User: result.rows[0]
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'user not found'
      });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message
    });
  }
};



// Car Owner


exports.registerHost = async (req, res) => {
  const { username, email, password, whatsapp_number, licence_no } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
    const role = 'car_owner';

    let profile_picture = '';
    let licence_picture = '';

    // Check if files were uploaded
    if (req.files) {
      const domain = process.env.DOMAIN || 'http://localhost';

      if (req.files['profile_picture']) {
        profile_picture = `${domain}/uploads/user/${req.files['profile_picture'][0].filename}`;
      }

      if (req.files['licence_picture']) {
        licence_picture = `${domain}/uploads/user/${req.files['licence_picture'][0].filename}`;
      }
    }

    await db.query('INSERT INTO users(username, email, password, whatsapp_number, profile_picture, licence_picture, role, licence_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
      username,
      email,
      hashedPassword,
      whatsapp_number,
      profile_picture,
      licence_picture,
      role,
      licence_no
    ]);

    return res.status(201).json({
      success: true,
      message: 'The Host registration was successful',
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
};


// Client
exports.registerRenter = async (req, res) => {
  const { username, email, password, whatsapp_number, licence_no } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
    const role = 'renter';

    let profile_picture = '';
    let licence_picture = '';

    // Check if files were uploaded
    if (req.files) {
      const domain = process.env.DOMAIN || 'http://localhost';

      if (req.files['profile_picture']) {
        profile_picture = `${domain}/uploads/user/${req.files['profile_picture'][0].filename}`;
      }

      if (req.files['licence_picture']) {
        licence_picture = `${domain}/uploads/user/${req.files['licence_picture'][0].filename}`;
      }
    }

    await db.query('INSERT INTO users(username, email, password, whatsapp_number, profile_picture, licence_picture, role, licence_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [
      username,
      email,
      hashedPassword,
      whatsapp_number,
      profile_picture,
      licence_picture,
      role,
      licence_no
    ]);

    return res.status(201).json({
      success: true,
      message: 'The Renter registration was successful',
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
}

// Login
exports.login = async (req, res) => {
  let user = req.user

  let payload = {
    id: user.user_id,
    email: user.email,
  }

  try {
    const token = await sign(payload, SECRET)

    return res.status(200).cookie('token', token, { httpOnly: true }).json({
      success: true,
      role: user.role,
      token: token,
      message: 'Logged in succefully',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      error: error.message,
    })
  }
}

exports.protected = async (req, res) => {
  try {
    return res.status(200).json({
      info: 'protected info',
    })
  } catch (error) {
    console.log(error.message)
  }
}

// Logout
exports.logout = async (req, res) => {
  try {
    return res.status(200).clearCookie('token', { httpOnly: true }).json({
      success: true,
      message: 'Logged out succefully',
    })
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({
      error: error.message,
    })
  }
}



exports.loginRole = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await db.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, role]);

    if (user.rowCount !== 1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await compare(password, user.rows[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      id: user.rows[0].user_id,
      email: user.rows[0].email,
      role: user.rows[0].role,
    };

    const token = sign(payload, SECRET, { expiresIn: '1h' });

    return res.status(200).cookie('token', token, { httpOnly: true }).json({
      success: true,
      role: user.rows[0].role,
      token,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error.message });
  }
};