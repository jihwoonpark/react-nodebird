const Sequelize = require('sequelize');
const dotenv = require('dotenv');

// const path = require('path');
// const fs = require('fs');
// const env = process.env.NODE_ENV || 'development';
// const config = require('../config/config')[env];\

dotenv.config();

let db = [];

//mysql에 접근해서 data내용을 가져와서 
const sequelize = new Sequelize( process.env.DATABASE,
  process.env.DB_USER, process.env.DB_PASSWORD,{
      host: process.env.DB_HOST,
      dialect: 'mysql',
      timezone: '+09:00', //한국 시간 셋팅
      operatorsAliases: Sequelize.Op,//연산자
      pool: {
          max: 5, //최대 유지 connection 수
          min: 0, //최소 유지 connection 수
          idle: 10000// connection을 몇ms까지 대기시킬 것인가 (이후엔 버려짐)
      },
      // logging:false;
  });

  
//테이블 생성-migration 생성 => 이 코드 계속 에러남
// fs.readdirSync(__dirname)//현재폴더 있는 파일들을 읽어옴
//     .filter(file => {//index.js파일제외 하고 models에 있는 파일을들 불러옴
//         return file.indexOf('.js') !== 0 && file !== 'index.js'
//     })
//     .forEach(file => {
//         //Products 모듈을 실행해서 모델을 만들고, db 배열에 넣음
//         var model = sequelize.import(path.join(__dirname, // models/Products.js 
//             file));
//             db[model.name] = model;
//     });

db.Comment = require('./comment')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Image = require('./image')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);


//관계설정
Object.keys(db).forEach(modelName => {
    if("associate" in db[modelName]){
        db[modelName].associate(db);//테이블들(모델)간의 관계를 설정 
        //ex)사용자정보 가져올때, 해당 사용자가 적은 게시글, 댓글, follower도 같이 가져와
        //mySQL에서는 join문을 써서 가져와야 하는 코드를 이렇게 간단하게 코딩함
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
