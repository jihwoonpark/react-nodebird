module.exports = (sequelize, DataTypes) =>{
    const Comment = sequelize.define('Comment',
    {//id는 mysql에서 자동으로 생성해줌, BIGINT: 64bit, UNSIGNED: 양수, 
        //id:{},
        content:{
            type:DataTypes.TEXT,
            allowNull:false,
        },
    },{
        // tableName:'Comment',
        charset:'utf8mb4', //mysql에 한글넣으면 에러나는데, 한글+이모티콘 사용가능하게함
        collate:'utf8mb4_general_ci',
    });

    Comment.associate = (db) => {
        db.Comment.belongsTo(db.User);
        db.Comment.belongsTo(db.Post);
      };

    return Comment;
}


