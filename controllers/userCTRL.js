const jwt = require("jsonwebtoken");
const UserModel = require("..//models/userModels");
const dotenv = require("dotenv");
dotenv.config();
const secret_key = process.env.SECRET_KEY;

//======================Функция регистрации
async function register(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "Error",
      code: 400,
      message: `Missing ${email ? "" : "email "}${
        password ? "" : "password "
      } field(`,
    });
  }

  const user = await UserModel.findOne({ email });

  if (user) {
    return res.status(409).json({
      status: "error",
      code: 409,
      message: "Such email almost in data base.",
      data: "Conflict email",
    });
  }
  try {
    const newUser = new UserModel({ email, password });

    await newUser.setPassword(password);

    const result = await newUser.save();

    res.json({
      status: "Success",
      code: 200,
      data: {
        ...result._doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "Bad Request",
      code: 400,
      message: "Something going wrong(",
      data: error,
    });
  }
}

//======================Функция логинизации
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "Error",
      code: 400,
      message: `Missing ${email ? "" : "email "}${
        password ? "" : "password "
      } field(`,
    });
  }

  const user = await UserModel.findOne({ email });

  if (!user || !user.validPassword(password)) {
    return res.status(400).json({
      status: "Error",
      code: 400,
      message: "Wrong email or password.",
      data: "Wrong email or password.",
    });
  }

  const payload = { id: user._id, email: user.email };

  const token = jwt.sign(payload, secret_key, { expiresIn: "1h" });

  const updateUser = await UserModel.findByIdAndUpdate(
    user._id,
    { token: token },
    { new: true }
  );

  res.status(200).json({
    status: "Success",
    code: 200,
    data: token,
    user: {
      ...updateUser._doc,
    },
  });
}

//======================Функция выхода из аккаунта
async function logout(req, res) {
  const id = { ...req.user[0] };

  const data = await UserModel.findByIdAndUpdate(
    id._doc._id,
    { token: null },
    { new: true }
  );

  res.status(204).json({
    status: "Success",
    code: 204,
    mesage: "No content",
  });
}

//======================Функция получения информации о текущем пользователе
async function getUser(req, res) {
  let response = req.user[0];

  return res.status(200).json({
    status: "Success",
    code: 200,
    data: { email: response.email, subscription: response.subscription },
  });
}

module.exports = {
  register,
  login,
  getUser,
  logout,
};
