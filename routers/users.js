const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();
//
router.get("/find", isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({where: {id: req.userId}});
    console.log(user);

    if(!user) {
      res.status(404).json({error: "ユーザーが見つかりませんでした。"});
    }

    // ユーザーが見つかった場合は、ユーザーのID、メールアドレス、ユーザーネームを含むオブジェクトをJSON形式でレスポンスとして返す
    res.status(200).json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.get("/profile/:userId", async (req, res) => {
  // urlからuserIdを取得
  const {userId} = req.params

  try{
    const profile = await prisma.profile.findUnique({
      // profileテーブルの中でuserIdが一致するプロフィールを取得
      where: {userId: parseInt(userId)},
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
      });

    if(!profile) {
      return res
        .status(404)
        .json({message: "プロフィールが見つかりませんでした。"});
    }

    res.status(200).json(profile);
  } catch(err) {
    console.log(err)
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
