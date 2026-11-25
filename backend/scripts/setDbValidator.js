const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/QuanLyMuonSachDB');
  const db = mongoose.connection.db;

  // 1. Chuẩn hóa lại bản ghi vừa bị sửa sai trong Compass (NgayTra = 2026-10-13 trong khi NgayMuon = 2026-11-13)
  const TheoDoiMuonSach = require('../models/TheoDoiMuonSach');
  const invalid = await TheoDoiMuonSach.find({
    $expr: {
      $or: [
        { $and: [{ $gt: ['$NgayMuon', null] }, { $gt: ['$HanTra', null] }, { $lt: ['$HanTra', '$NgayMuon'] }] },
        { $and: [{ $gt: ['$NgayMuon', null] }, { $gt: ['$NgayTra', null] }, { $lt: ['$NgayTra', '$NgayMuon'] }] }
      ]
    }
  });

  console.log('So phieu dang bi sai:', invalid.length);
  for (const doc of invalid) {
    if (doc.NgayTra && doc.NgayMuon && doc.NgayTra < doc.NgayMuon) {
      doc.NgayTra = doc.NgayMuon; // đưa NgayTra về hợp lệ
    }
    if (doc.HanTra && doc.NgayMuon && doc.HanTra < doc.NgayMuon) {
      doc.HanTra = new Date(doc.NgayMuon.getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    await doc.save();
    console.log('Da sua ban ghi:', doc._id);
  }

  // 2. Thiết lập Schema Validation TRỰC TIẾP TRÊN DATABASE ENGINE CỦA MONGODB
  // Sau khi thiết lập lệnh này, kể cả người dùng mở MongoDB Compass bấm bút chì sửa
  // thì MongoDB Engine cũng sẽ CHẶN và báo lỗi Document failed validation!
  await db.command({
    collMod: 'theodoimuonsaches',
    validator: {
      $expr: {
        $and: [
          {
            $or: [
              { $not: ['$HanTra'] },
              { $not: ['$NgayMuon'] },
              { $gte: ['$HanTra', '$NgayMuon'] }
            ]
          },
          {
            $or: [
              { $not: ['$NgayTra'] },
              { $not: ['$NgayMuon'] },
              { $gte: ['$NgayTra', '$NgayMuon'] }
            ]
          }
        ]
      }
    },
    validationLevel: 'strict',
    validationAction: 'error'
  });

  console.log('DA BAT RANG BUOC NATIVE MONGODB ENGINE THANH CONG!');

  // 3. Test thử sửa trực tiếp qua MongoDB native driver (giống hệt Compass)
  try {
    await db.collection('theodoimuonsaches').updateOne(
      { _id: new mongoose.Types.ObjectId('6af706df186522e171c2825c') },
      { $set: { HanTra: new Date('2020-01-01') } }
    );
    console.log('LỖI: MongoDB Engine vẫn cho sửa!');
  } catch (err) {
    console.log('THÀNH CÔNG RỰC RỠ: MongoDB Engine (kể cả Compass) đã CHẶN!');
    console.log('Error code:', err.code, err.message);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
