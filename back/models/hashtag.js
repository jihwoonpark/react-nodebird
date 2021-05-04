module.exports = (sequelize, DataTypes) =>{
    const Hashtag = sequelize.define('Hashtag',
    {//id는 mysql에서 자동으로 생성해줌, BIGINT: 64bit, UNSIGNED: 양수, 
        //id:{},
        name:{
            type:DataTypes.STRING(20),
            allowNull:false,
        },      
    },{
        // tableName:'Hashtag',
        charset:'utf8mb4', //mysql에 한글넣으면 에러나는데, 한글+이모티콘 사용가능하게함
        collate:'utf8mb4_general_ci',
    });

    Hashtag.associate = (db) => {
        //through : 다대다관계시 관계정리 table
        db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
      };
    
    return Hashtag;
}


