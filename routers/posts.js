const router = require("express").Router();
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

// 呟き投稿用API
router.post("/post", isAuthenticated, async (req, res) => {
  // 入力内容を取得し、contentに代入
  const {content} = req.body;
  console.log("content");

  // 投稿内容がない場合はエラーを返す
  if (!content) {
    return res.status(400).json({error: "投稿内容がありません。"});
  }

  try {
    // 投稿をDBに保存
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: req.userId,
      },
      include: {
        author: {
          include: {
            profile: true,
          }
        }
      },
    });
    res.status(201).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "サーバーエラーです。"})
  }
});

// 最新呟き取得用API
// /get_latest_postへアクセスがあった場合に処理が実行される
router.get("/get_latest_post", async (req, res) => {
  try {
    // 最新の投稿10件を取得し、投稿日時の降順に並べ替える
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: {createdAt: "desc"},
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
  });
    // 取得した最新の投稿の配列をJSON形式でクライアントに返す
    return res.json(latestPosts);
  } catch (err) {
    console.log(err);
    res.status(500).json({message: "サーバーエラーです。"});
  }
});

// その閲覧しているユーザーの投稿内容だけを取得
router.get("/:userId", async (req, res) => {
  const {userId} = req.params;

  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: true,
      }
      });

    return res.status(200).json(userPosts);
  } catch(err) {
    console.log(err);
    res.status(500).json({message: "サーバーエラーです。"});
  }
})

module.exports = router;
