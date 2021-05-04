const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email', //req.body.email 프론트에서 보내준 데이터명
    passwordField: 'password',//req.body.password => 아래 email, password로 들어감
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({
        where: { email }
      });
      if (!user) {
        //done 인자1:서버측 에러시/인자2:서버측 성공시/인자3:로직상에서 에러시
        return done(null, false, { reason: '존재하지 않는 이메일입니다!' });
      }
      //front에서 온 password와 db의 password비교
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        return done(null, user);
      }
      return done(null, false, { reason: '비밀번호가 틀렸습니다.' });
    } catch (error) {
      console.error(error);
      return done(error);
    }
  }));
};




