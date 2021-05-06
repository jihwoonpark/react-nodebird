const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();
//s3로 이미지를 업로드할때 lambda를 실행하게 함
//event에 s3업로드 이벤트가 들어있음
exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name; // 버킷명
  const Key = decodeURIComponent(event.Records[0].s3.object.key); // original/112_abc.png, 한글파일명하려면 decode~
//   console.log(Bucket, Key);
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length - 1].toLowerCase(); //확장자 소문자로 
  const requiredFormat = ext === 'jpg' ? 'jpeg' : ext; //sharp에 jpeg로 전달해야 함
//   console.log('filename', filename, 'ext', ext);

  try {
    const s3Object = await s3.getObject({ Bucket, Key }).promise(); //이미지 가져오기
    // console.log('original', s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body) //s3Object.Body : 이미지 바이너리(0100~) 저장되어있음
      .resize(400, 400, { fit: 'inside' }) //사이즈 지정
      .toFormat(requiredFormat) //jpg=>jpeg
      .toBuffer();
    await s3.putObject({ //리사이징 후 이미지 업로드 
      Bucket,
      Key: `thumb/${filename}`, //썸네일 폴더에 넣음
      Body: resizedImage,
    }).promise();
    // console.log('put', resizedImage.length);
    return callback(null, `thumb/${filename}`); //callback(서버에러,성공)
  } catch (error) {
    console.error(error)
    return callback(error);
  }
}