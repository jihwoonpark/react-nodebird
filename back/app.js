//서버를 구성해주는 프레임워크
const express = require("express");
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path')
const hpp = require('hpp');
const helmet = require('helmet');

//flash 메시지 관련
const flash = require('connect-flash');

const app = express();
const port = 80;

// db 관련
const db = require('./models');

//passport 로그인 관련
const passport = require('passport');
const expressSession = require('express-session');
const passportConfig = require('./passport');
const FileStore = require('session-file-store')(expressSession);

//라우팅관련
const postRouter = require("./routes/post");
const postsRouter = require('./routes/posts');
const userRouter = require("./routes/user");
const hashtagRouter = require("./routes/hashtag");

dotenv.config();//.env파일 불러와서 process.env에 넣음

// DB authentication
db.sequelize
	.authenticate()
	.then(() => {
		console.log("Connection has been established successfully.");
		return db.sequelize.sync();
		// return db.sequelize.drop();
	})
	.then(() => {
		console.log("DB Sync complete.");
	})
	.catch((err) => {
		console.error("Unable to connect to the database:", err);
});

if(process.env.NODE_ENV === 'production'){
	app.use(morgan('combined'));//좀 더 자세히 로깅함
	app.use(hpp());
	app.use(helmet());
}else{
	app.use(morgan('dev'));//요청들어오는 것을 기록으로 남김
}


app.use(cors({//쿠키를 주고 받을 수 있게 함
    //'*'-모든 요청을 받아줌, true-보낸곳의 주소가 자동으로 들어감 'http://localhost:3000'-해당 도메인만 허용
	origin: ['http://localhost:3060','http://aserang.com'], 
	credentials: true,// true로 해야지 쿠키도 전달됨, front axios에서도 설정해줘야 함
}));
//'/'는 uploads폴더를 root 폴더인것처럼 사용할 수 있게 함(front에서 /img-cj~.png로 접근가능)
app.use('/', express.static(path.join(__dirname,'uploads')));
//app.use() 첫번째 인자 생략하면 '/'이 있는 것(모든 곳에서 오는 요청 처리)
//saga에서 axios.post 비동기통신요청 데이터를 받아서, req.body에 담음
app.use(express.json());//json형식으로 온 요청을 처리해서 request.body에 담음
app.use(express.urlencoded({ extended: true }));//form submit으로 넘어온 데이터를 request.body에 담음
app.use(cookieParser(process.env.COOKIE_SECRET));//req.headers.cookie 문자열을 {key:value}로 객체화 
											 //req.cookie로 cookie에 접근 가능한 듯
											 //expressSession secret키를 통해 세션복호화
//옵션
//secret – 세션으로 암호화된 쿠키(세션아이디)를 만들때 쓰이는 비밀번호
//resave – 세션을 언제나 저장할 지 (변경되지 않아도) 정하는 값입니다. express-session documentation에서는 이 값을 false 로 하는것을 권장하고 필요에 따라 true로 설정합니다.
//saveUninitialized – 세션이 저장되기 전에 uninitialized 상태로 미리 만들어서 저장합니다.
//cookie > httpOnly:자바스크립트로 쿠키접근못함, secure:https사용시 true로 설정

app.use(expressSession({
	resave:false,
	saveUninitialized:false,
	secret:process.env.COOKIE_SECRET,
	cookie:{
		httpOnly:true,
		sameSite:"none",
		secure:true,
		domain: process.env.NODE_ENV ==='production' && '.aserang.com',//.aserang=>(.)점을 붙여야 api.aserang과 aserang과의 쿠키공유가능
		maxAge:2000*60*60 //지속시간 2시간
	},
	store: new FileStore(),
	name:'rnbck'//초기값이 connect.sid인데 해커들의 공격 타겟이 될 수 있어서 변경해 줌
}))

//passport 적용
passportConfig();//passport폴더 index.js 내용을 여기서 실행
app.use(passport.initialize());//express에서 passport를 사용하겠다
app.use(passport.session());//passport에서 session을 사용하겠다

//플래시 메시지 관련
app.use(flash()); //flash객체생성

app.get("/", (req, res) => {
	res.send("hello express");
});


// API는 다른 서비스가 내 서비스의 기능을 실행할 수 있게 열어둔 창구
app.use('/posts', postsRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

app.listen(port, () => {
	console.log("Express Server Listening on port", port);
});
