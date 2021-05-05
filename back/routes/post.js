const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

const { Post, Image, Comment, User, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();
dotenv.config();
try {
  fs.accessSync('uploads');//uploads폴더에 접근, 없으면 error 남
} catch (error) {
  console.log('uploads 폴더가 없으므로 생성합니다.');
  fs.mkdirSync('uploads');
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region:process.env.S3_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),//S3의 권한(key, id)을 얻음
    bucket: process.env.S3_BUCKET,//버킷명
    key(req, file, cb) {
      cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`)//버킷에 폴더를 만들어서 넣음
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});


// const upload = multer({
//   storage: multer.diskStorage({
//     destination(req, file, done) {
//       done(null, 'uploads'); //uploads폴더에 저장
//     },
//     filename(req, file, done) { // 제로초.png
//       const ext = path.extname(file.originalname); // 확장자 추출(.png)
//       const basename = path.basename(file.originalname, ext); // 제로초
//       done(null, basename + '_' + new Date().getTime() + ext); // 제로초15184712891.png
//     },
//   }),
//   limits: { fileSize: 20 * 1024 * 1024 }, // 20MB로 파일크기 제한
// });



//front input 하나에서 text만있으면 none, 한개사진 single, 여러사진 array,
//여러 input에서 여러사진 fields
//multer에서도 단순 text는 req.body로 받게 함, 
router.post('/', isLoggedIn, upload.none(), async (req, res, next) => { // POST /post
  try { 
    //https://regexr.com/
    const hashtags = req.body.content.match(/#[^\s#]+/g); //[^\s#] 공백아니고~ #도 아니고.. ^에 두개다 묶임
    const post = await Post.create({
      content: req.body.content, //front에서 formData.append('content',text)
      UserId: req.user.id,
    });
    if (hashtags) {
      //result에 배열로 담김
      const result = await Promise.all(hashtags.map((tag) => Hashtag.findOrCreate({
        where: { name: tag.slice(1).toLowerCase() },
      }))); // [[노드, true], [리액트, true]] //findOrCreate 결과 result : [[Hashtag{},true]]
      // console.log('hashtag',result);
      await post.addHashtags(result.map((v) => v[0]));
    }
    if (req.body.image) {
      if (Array.isArray(req.body.image)) { // 이미지를 여러 개 올리면 image: [제로초.png, 부기초.png]
        const images = await Promise.all(req.body.image.map((image) => Image.create({ src: image })));
        await post.addImages(images);
      } else { // 이미지를 하나만 올리면 image: 제로초.png
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [{
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User, // 댓글 작성자
          attributes: ['id', 'nickname'],
        }],
      }, {
        model: User, // 게시글 작성자
        attributes: ['id', 'nickname'],
      }, {
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }]
    })
    res.status(201).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/images', isLoggedIn, upload.array('image'), (req, res, next) => { // POST /post/images
  console.log(req.files);
  res.json(req.files.map((v) => v.location)); //filename=>location
});

router.get('/:postId',async(req,res,next)=>{ // GET /post/1  
  try{
    const post = await Post.findOne({
      where:{id:req.params.postId},    
    })
    if(!post){
      return res.status(404).send('존재하지 않는 게시글입니다.');
    }
    const fullPost = await Post.findOne({
      where:{id:post.id},
      include:[{
        model:Post,
        as:'Retweet',
        include:[{
          model:User,
          attributes:['id','nickname'],
          },{
            model:Image,
          }]
      },{
        model:User,
        attributes:['id','nickname']
      },{
        model:User,
        as:'Likers',
        attributes:['id'],
      },{
        model:Image,
      },{
        model:Comment,
        include:[{
          model:User,
          attributes:['id','nickname'],
        }],
      }],
    })
    res.status(201).json(fullPost);

  }catch(error){
    console.error(error);
    next(error);
  }
})


router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => { // POST /post/1/retweet
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
      include: [{
        model: Post,
        as: 'Retweet',
      }],
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    //자기게시물 리트윗과 남이 내 게시물 리트윗한것을 내가 다시 리트윗하는거 막음
    if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
      return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
    }
    //retweetid가 있으면 쓰고, 없으면(null) post.id를 사용 | 남이 남의 리트윗한 게시물을 다시 리트윗할 수도 있음
    const retweetTargetId = post.RetweetId || post.id;
    //내가 이미 리트윗한 게시물은 리트윗못하게 막음
    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) {
      return res.status(403).send('이미 리트윗했습니다.');
    }
    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: 'retweet',
    });
    const retweetWithPrevPost = await Post.findOne({
      where: { id: retweet.id },
      include: [{
        model: Post,
        as: 'Retweet',
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }, {
          model: Image,
        }]
      }, {
        model: User,
        attributes: ['id', 'nickname'],
      },{
        model: User, // 좋아요 누른 사람
        as: 'Likers',
        attributes: ['id'],
      }, {
        model: Image,
      }, {
        model: Comment,
        include: [{
          model: User,
          attributes: ['id', 'nickname'],
        }],
      }],
    })
    res.status(201).json(retweetWithPrevPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:postId/comment', isLoggedIn, async (req, res, next) => { // POST /post/1/comment
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await Comment.create({
      content: req.body.content,
      PostId: parseInt(req.params.postId, 10),
      UserId: req.user.id,
    })
    const fullComment = await Comment.findOne({
      where: { id: comment.id },
      include: [{
        model: User,
        attributes: ['id', 'nickname'],
      }],
    })
    res.status(201).json(fullComment);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.patch('/:postId/like', isLoggedIn, async (req, res, next) => { // PATCH /post/1/like
  try {    
    const post = await Post.findOne({ where: { id: req.params.postId }});
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    //post와 user다대다관계, Like테이블에서 Liked 컬럼에 찾은 post의 id와 Likers컬럼에 req.user.id가 쓰여지고 연결됨
    await post.addLikers(req.user.id); 
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId/like', isLoggedIn, async (req, res, next) => { // DELETE /post/1/like
  try {
    const post = await Post.findOne({ where: { id: req.params.postId }});
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    //post와 user다대다관계, Like테이블에서 Liked 컬럼에 찾은 post의 id와 Likers컬럼에 req.user.id가 삭제되고 연결끊김
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:postId', isLoggedIn, async (req, res, next) => { // DELETE /post/10
  try {
    await Post.destroy({ //삭제 
      where: {
        id: req.params.postId,
        UserId: req.user.id,
      },
    });
    res.status(200).json({ PostId: parseInt(req.params.postId, 10) });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;

