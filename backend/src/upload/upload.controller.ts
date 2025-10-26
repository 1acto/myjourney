// backend/src/upload/upload.controller.ts

import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path'; 

// ฟังก์ชันสร้างชื่อไฟล์ที่ไม่ซ้ำกันโดยใช้ Timestamp และชื่อไฟล์เดิม
const editFileName = (req, file, callback) => {
  // 1. แยกชื่อไฟล์ออกจากนามสกุล (เช่น 'my_photo.jpg' -> 'my_photo')
  const originalName = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '_'); // เปลี่ยนอักขระที่ไม่ใช่ตัวอักษร/ตัวเลข เป็น _
  const timestamp = Date.now();
  const randomHash = Math.random().toString(36).substring(2, 6); // สุ่ม 4 ตัวอักษร
    
  const newName = `${safeName}_${timestamp}_${randomHash}`;
    
  // 3. ส่งชื่อไฟล์ใหม่ไปให้ Multer บันทึก
  callback(null, `${newName}${fileExtName}`); 
};

@Controller('upload')
export class UploadController {

  // ไม่มี constructor หรือ service เพราะไม่มี logic ที่ต้องใช้
  
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', { // 'file' คือชื่อ field ใน form-data
      storage: diskStorage({
        destination: './uploads', // **บันทึกไฟล์ในโฟลเดอร์ uploads ที่ Root ของ Backend**
        filename: editFileName,
      }),
      fileFilter: (req, file, callback) => {
        // จำกัดประเภทไฟล์
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }
    
    // สร้าง URL สำหรับบันทึกใน DB
    const imageUrl = `/uploads/${file.filename}`; 

    // คืนค่า URL ที่ Frontend จะนำไปใช้บันทึกใน CreatePoiDto
    return { url: imageUrl }; 
  }
}