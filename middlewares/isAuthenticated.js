const jwt = require("jsonwebtoken");

// トークンを持っているユーザーかチェックするミドルウェア
function isAuthenticated(req, res, next) {
  // ?. はオプショナルチェイニング演算子で、req.headers.authorization が undefined や null でない場合にのみ .split(" ")[1] の操作を実行する。
  // このように書くことで、undefined や null の場合にエラーを防ぐことができます。
  const token = req.headers.authorization?.split(" ")[1];

  if(!token) {
    return res.status(401).json({message: "権限がありません。"});
  }

  //jwt.verify 関数を使ってトークンが有効かどうかを検証し、有効であればリクエスト処理を続行する。
  // decoded 引数は、jwt.verify 関数によってトークンの検証とデコードが成功した場合に返されるオブジェクト
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if(err) {
      console.log(err);
      return res.status(401).json({message: "権限がありません。"});
    }
    console.log(decoded.id);

    req.userId = decoded.id;

    // これを書くことでposts.jsでmiddleware(isAuthenticated)の次の処理に進む
    next();
  });
}

module.exports = isAuthenticated;