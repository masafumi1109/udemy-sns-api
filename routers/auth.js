const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateIdenticon = require("../utils/generateIdenticon");

const prisma = new PrismaClient();

// 新規ユーザー登録API
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generateIdenticon(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: "初めまして",
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return res.json({ user });
});

// ユーザーログインAIP
router.post("/login", async (req, res) => {
  const {email, password} = req.body;

  const user = await prisma.user.findUnique({where: {email}});

  if (!user) {
    return res
      .status(401)
      .json({error: "メールアドレスかパスワードが間違っています。"});
  }
  console.log(user);

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res
      .status(401)
      .json({error: "パスワードが間違っています。"});
  }
  console.log(isPasswordValid);

  const token = jwt.sign({id: user.id}, process.env.SECRET_KEY, {
    expiresIn: "1d"
  });

  return res.json({ token });
});

module.exports = router;
