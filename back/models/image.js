module.exports = (sequelize, DataTypes) =>{
    const Image = sequelize.define('Image',
    {//id는 mysql에서 자동으로 생성해줌, BIGINT: 64bit, UNSIGNED: 양수, 
        //id:{},
        src:{
            type:DataTypes.STRING(30),
            allowNull:false,
        },      
    },{
        // tableName:'Image',
        charset:'utf8', //mysql에 한글넣으면 에러나는데, 한글사용가능하게 함
        collate:'utf8_general_ci',
    });

    Image.associate = (db) => {
        db.Image.belongsTo(db.Post); //이미지는 게시글에 속함
      };

    return Image;
}


