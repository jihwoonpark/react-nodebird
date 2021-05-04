const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { Op } = require('sequelize');

const { User, Post, Comment, Image } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/',async (req,res,next)=>{ //GET /user => 새로고침할때마다 이 요청이 들어옴
  console.log('back/routes/user/req.headers',req.headers)
  try {
    if(req.user){ //로그인 안하고 새로고침하면 req.user가 없어서 에러남, 로그인 했을때만 실행
      const fullUserWithoutPassword = await User.findOne({
        where: { id: req.user.id },
        //로긴 후 사용자정보와 post,follower,following 정보 같이 보낼때, 
        //include를 통해 sequ~이 user와 관계있는 테이블들을 자동으로 가져옴
        //user테이블에서 보안상문제로 password 빼고 id, nickname, userId열의 값만 가져옴
        attributes: {
          exclude: ['password']
        },
        include: [{
          model: Post,//post 테이블에서 PostsId 열의 값
          as:'Posts',
          attributes: ['id'],//post테이블에서 모든 값이 아닌 id열의 값만 가져옴
        }, {
          model: User,//user 테이블에서 FollowingsId 열의 값
          as: 'Followings',
          attributes: ['id'],
        }, {
          model: User,
          as: 'Followers',
          attributes: ['id'],
        }]
      })
      res.status(200).json(fullUserWithoutPassword);
    }else{
      res.status(200).json(null); //로그인 하지 않았으면 아무것도 보내지 않음
    }    
  }catch(e){
    console.error(e);
    next(e);
  };  
})

router.get('/followers', isLoggedIn, async (req, res, next) => { // GET /user/followers 팔로워 목록불러오기
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.status(403).send('없는 사람을 찾으려고 하시네요?');
    }
    const followers = await user.getFollowers();
    res.status(200).json(followers);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/followings', isLoggedIn, async (req, res, next) => { // GET /user/followings 팔로잉 목록불러오기
  try {
    const user = await User.findOne({ where: { id: req.user.id }});
    if (!user) {
      res.status(403).send('없는 사람을 찾으려고 하시네요?');
    }
    const followings = await user.getFollowings();
    res.status(200).json(followings);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:userId', async (req, res, next) => { // GET /user/1
  try {
    const fullUserWithoutPassword = await User.findOne({
      where: { id: req.params.userId },
      attributes: {
        exclude: ['password']
      },
      include: [{
        model: Post,
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followings',
        attributes: ['id'],
      }, {
        model: User,
        as: 'Followers',
        attributes: ['id'],
      }]
    })
    if (fullUserWithoutPassword) {
      const data = fullUserWithoutPassword.toJSON();
      data.Posts = data.Posts.length; // 개인정보 침해 예방
      data.Followers = data.Followers.length;
      data.Followings = data.Followings.length;
      res.status(200).json(data);
    } else {
      res.status(404).json('존재하지 않는 사용자입니다.');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:userId/posts', async(req,res,next)=>{ // GET/user/1/posts
  try{
    const user = await User.findOne({
      where:{id:req.params.userId}
    });
    if(user){
      const where={};
      if (parseInt(req.query.lastId, 10)){ //초기로딩이 아닐 때 
        where.id = {[Op.lt]:parseInt(req.query.lastId,10)}
      }
      const posts = await user.getPosts({
        where,
        limit:10,
        include:[{
          model:Image,
          },{
          model:Comment,
          include:[{
            model:User,
            attributes:['id','nickname']
          }]
        },{
          model:User,
          attributes:['id','nickname'],
        },{
          model:User,
          through:'Like',
          as:'Likers',
          attributes:['id'],
        },{
          model:Post,
          as:'Retweet',
          include:[{
            model:User,
            attributes:['id','nickname']
          },{
            model:Image,
          }]
        }],
      });
      res.status(200).json(posts);
    }else{
      res.status(404).send('존재하지 않는 사용자입니다.')
    };
  }catch(error){
    console.error(error);
    next(error)
  }
} )



router.post('/login', isNotLoggedIn, (req, res, next) => {// POST /api/user/login  => 미들웨어 확장
    //passport.use에서 done(null,user,{})=>err, user, info 전달
    passport.authenticate('local',
    // { failureRedirect: '/accounts/login', failureFlash: true } //fastcampus에서 가져옴, 
    (err, user, info) => {
      if (err) { //서버에 에러라면
        console.error(err);
        return next(err); //app.js에서 app.listen 바로위에 (보이지는 않지만) 에러처리 미들웨어가 잇는데, 거기로 한방에 감
      }
      if (info) {//로직상 에러라면, passport.user에서 지정된 done(~{ reason: '비밀번호가 틀립니다.' });가 전송
        return res.status(401).send(info.reason);//401:허가되지 않음, 로그인에러시 표시에러
      }
      //req.login(user,~) user를 로그인하고, 이 user를 serializeUser의 user로 전달   
      //우리 서버 로그인 성공하면, passport로그인을 진행하는데, 이때 세션이 쓰임
      //세션은 백서버에 있는 사용자 데이터인데, 전체 사용자데이터를 가지고 있으면 메모리낭비가 심함
      //따라서 passport에서는 사용자데이터 중 id만 저장하고 이 id로 쿠키를 구워서 식별에 사용함
      //사용자 전체데이터가 필요할때는 id를 가지고 db에 가서 가져옴
      //사용자늘어나면 세션 저장용 DB로 redis를 사용함
      return req.login(user, async (loginErr) => {//local다음 passport로그인 절차 진행
        if (loginErr) {
          console.error(loginErr);
          return next(loginErr);
        }
        const fullUserWithoutPassword = await User.findOne({
          where: { id: user.id },
          //로긴 후 사용자정보와 post,follower,following 정보 같이 보낼때, 
          //include를 통해 sequ~이 user와 관계있는 테이블들을 자동으로 가져옴
          //user테이블에서 보안상문제로 password 빼고 id, nickname, userId열의 값만 가져옴
          attributes: {
            exclude: ['password']
          },
          include: [{
            model: Post,//post 테이블에서 PostsId 열의 값
            as:'Posts',
            attributes: ['id'],//post테이블에서 모든 값이 아닌 id열의 값만 가져옴
          }, {
            model: User,//user 테이블에서 FollowingsId 열의 값
            as: 'Followings',
            attributes: ['id'],
          }, {
            model: User,
            as: 'Followers',
            attributes: ['id'],
          }]
        })
        res.status(200).json(fullUserWithoutPassword);
      });
    })(req, res, next);
  });


router.post('/', isNotLoggedIn, async(req,res,next)=>{ // POST /api/user 회원가입
    try{
        const exUser = await User.findOne({
            where:{
                email:req.body.email,
            }
        })
        if(exUser){
            return res.status(403).send('이미 사용중인 아이디입니다.')
        }
        const hashedPassword = await bcrypt.hash(req.body.password,12);//salt는 10~13사이가 적당, 숫자커질수록 해킹어려워짐 but 속도하락
        const newUser = await User.create({
            email:req.body.email,
            nickname:req.body.nickname,
            password:hashedPassword,
        });
    res.status(200).json(newUser);//json객체로 보냄
    }catch(e){
        console.error(e);
        return next(e);
    };
});

router.post('/logout',isLoggedIn, (req,res,next)=>{
  req.logout();
  req.session.destroy();
  res.send('ok');
})

router.patch('/nickname',isLoggedIn, async (req,res,next)=>{
  try{
    await User.update({
      nickname:req.body.nickname,      
    },{
    where:{id : req.user.id},
  })
  res.status(200).json({nickname:req.body.nickname})
  }catch(e){
    console.error(e);
    next(e)
  }

})

router.patch('/:userId/follow', isLoggedIn, async (req, res, next) => { // PATCH /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('없는 사람을 팔로우하려고 하시네요?');
    }
    await user.addFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});


router.delete('/:userId/follow', isLoggedIn, async (req, res, next) => { // DELETE /user/1/follow
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('없는 사람을 언팔로우하려고 하시네요?');
    }
    await user.removeFollowers(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/follower/:userId', isLoggedIn, async (req, res, next) => { // DELETE /user/follower/2
  try {
    const user = await User.findOne({ where: { id: req.params.userId }});
    if (!user) {
      res.status(403).send('없는 사람을 차단하려고 하시네요?');
    }
    await user.removeFollowings(req.user.id);
    res.status(200).json({ UserId: parseInt(req.params.userId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});



module.exports = router;



