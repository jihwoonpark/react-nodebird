const passport = require('passport');
const local = require('./local');
const db = require('../models');

module.exports = () => {
  //로그인성공시 1회호출, local에서 인증한 사용자데이터가 user에 담김
  //done의 2번째인자->deserializeUser id로 연결 
  //session폴더의 식별자파일에 "passport":{"user":"egoing777@gmail.com"} 생성  
  passport.serializeUser((user, done) => { // 서버쪽에 [{ id: 1, cookie: 'clhxy' }]
    done(null, user.id);//user.id는 쿠키를 만드는데 쓰이고, deserial~의 첫번째인자로 감=
  });

  //로그인후 페이지방문마다 호출, id로 mySQL를 조회해서 실제 사용자 데이터 가져옴
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.User.findOne({
        where: { id },
        include: [{
          model: db.Post,
          as: 'Posts',
          attributes: ['id'],
        }],
      });
      done(null, user); // req.user에 user를 전달
    } catch (error) {
      console.error(error);
      done(error);
    }
  });

  local();//local.js와 연결
};

// 프론트에서 서버로는 cookie만 보내요(clhxy)
// 서버가 쿠키파서, 익스프레스 세션으로 쿠키 검사 후 id: 1 발견
// id: 1이 deserializeUser에 들어감
// req.user로 사용자 정보가 들어감

// 요청 보낼때마다 deserializeUser가 실행됨(db 요청 1번씩 실행)
// 실무에서는 deserializeUser 결과물 캐싱

