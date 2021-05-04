module.exports = (sequelize, DataTypes) =>{
    const Post = sequelize.define('Post',
    {//id는 mysql에서 자동으로 생성해줌, BIGINT: 64bit, UNSIGNED: 양수, 
        //id:{},
        content:{
            type:DataTypes.TEXT,
            allowNull:false,
        },      
    },{
        // tableName:'Post',
        charset:'utf8mb4', //mysql에 한글넣으면 에러나는데, 한글+이모티콘 사용가능하게함
        collate:'utf8mb4_general_ci',
    });

    Post.associate = (db) => {
        //게시글은 유저에 속함
        db.Post.belongsTo(db.User); // 테이블에 UserId 컬럼이 생겨요
        //게시글은 여러 댓글과 이미지 가짐
        db.Post.hasMany(db.Comment);
        db.Post.hasMany(db.Image);
        //게시글은 여러게시글에 쓰임
        db.Post.belongsTo(db.Post, { as: 'Retweet' }); // RetweetId 컬럼 생겨요
        //게시글은 여러해시태그 가짐, 해시태그는 여러 게시글에 쓰임
        db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
        db.Post.belongsToMany(db.User, { through: 'Like', as: 'Likers' });
      };
      return Post;
}

//리트윗 설명, 1번 게시물을 2,3,4번 게시물이 리트윗한 경우의 Post 테이블
/*
id content  RetweetId
 1            null
 2             1
 3             1
 4             1
*/

