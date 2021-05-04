const db = require(".");

module.exports = (sequelize, DataTypes) =>{
    const User = sequelize.define('User',
    {//id는 mysql에서 자동으로 생성해줌, BIGINT: 64bit, UNSIGNED: 양수, 
        //id:{},
        email:{
            type:DataTypes.STRING,// TEXT 긴글, DATETIME
            validate:{
                len:[0,30]
            },            
            allowNull:false, //필수
            unique:true,//고유
        },
        nickname:{
            type:DataTypes.STRING,
            validate:{
                len:[0,30]
            },
            allowNull:false,
        },
        password:{
            type:DataTypes.STRING,
            validate:{
                len:
                [3,100] //비밀번호는 암호화하면 길어짐
            },
            allowNull:false,
        },        
    },{
        // tableName:'User',
        charset:'utf8', //mysql에 한글넣으면 에러나는데, 한글사용할 수 있게 함
        collate:'utf8_general_ci',//한글저장
    });

    User.associate = (db) => {
        //유저는 여러개의 게시글, 댓글 생성 / 포스트를 생성할때는 일대다관계
        //as: 이름이 같을 때, 구분하기 위해사용하는 별칭, 값을 가져올때 as 이름 씀
        //as는 자바스크립트에서 구별하는 이름이고, foreignKey는 실제 db에서 사용하는 컬럼명?
        //유저A의 liked post들을 가져와라-> liked 이름으로 값을 가져옴
        //db.User.belongsToMany(db.Post~)와 혼돈
        db.User.hasMany(db.Post, { as: 'Posts' });
        db.User.hasMany(db.Comment);
        //포스트에 like달 때는 다대다 관계
        //through: 관계중간에 서로의 관계를 정리해주는 table
        //유저는 여러게시글에 좋아요 누름, 게시글은 여러유저로부터 좋아요 받음
        db.User.belongsToMany(db.Post, { through: 'Like', as: 'Liked' });
        //유저는 여러유저 follow할수 있고, follow 받을 수 있음
        //foreignKey명은 as명과 반대로 써야함. 남의 테이블 id를 가리키기 때문
        db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'followingId' });
        db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'followerId' });
      };

      return User;
}


// // create 하기 전에 실행되는 hooks
// User.beforeCreate((user, _) => {
//     user.password = passwordHash(user.password);
// });



