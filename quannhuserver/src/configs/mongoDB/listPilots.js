import mongoose from 'mongoose';
import { Schema } from "mongoose";
import unorm from 'unorm';
import fieldDisplayMappingPilots from '../mappingPilots.js';

// Chuẩn hóa giá trị tiếng Việt (chỉ áp dụng với chuỗi)
const normalizeVietnamese = (data) => {
  return typeof data === 'string' ? unorm.nfc(data) : data;
};

// Định nghĩa schema cho Item
const ItemSchema = new Schema({
  info: {
    fullName: { type: String, set: normalizeVietnamese }, // Áp dụng chuẩn hóa trực tiếp
    ID: { type: String },
    gender: { type: String },
    PHCDD: { type: Number },
    rank: { type: String },
    unit: { type: String },
    type: { 
      type: String, 
      enum: ["pilot", "parachutist"], // Chỉ chấp nhận hai giá trị này
      required: true, // Bắt buộc nhập
    },
  },
  size: {
    hatLiningsz: { type: String },
    flyingClothes: { type: String },
    flyingUnderwearsz: { type: String },
    flyingLeatherJacketsz: { type: String },
    sweatersz: { type: String },
    skydivingShoessz: { type: String },
    flyingShoes: { type: String },
    warmClothessz: { type: String },
    physicalTrainingClothessz: { type: String },
  },
  data: {
    hatLining: { type: Number, default: 0 },
    flyingClothesSummer: { type: Number, default: 0 },
    flyingClothesWinter: { type: Number, default: 0 },
    flyingUnderwear: { type: Number, default: 0 },
    flyingLeatherJacket: { type: Number, default: 0 },
    sweater: { type: Number, default: 0 },
    leatherGloves: { type: Number, default: 0 },
    fiberGloves: { type: Number, default: 0 },
    flyingShoesHigh: { type: Number, default: 0 },
    flyingShoesLow: { type: Number, default: 0 },
    skydivingShoes: { type: Number, default: 0 },
    socks: { type: Number, default: 0 },
    mattress: { type: Number, default: 0 },
    mattressCover: { type: Number, default: 0 },
    mat: { type: Number, default: 0 },
    tulleCurtain: { type: Number, default: 0 },
    physicalTrainingClothes: { type: Number, default: 0 },
    warmClothes: { type: Number, default: 0 },
  },
});

// Tạo thuộc tính ảo để hiển thị dữ liệu từ `fieldDisplayMappingPilots`
const createVirtualFields = (schema, prefix) => {
  for (const field in fieldDisplayMappingPilots) {
    if (schema.paths[`${prefix}.${field}`]) {
      schema.virtual(`${prefix}.${field}_display`).get(function () {
        return fieldDisplayMappingPilots[field];
      });
    }
  }
};

createVirtualFields(ItemSchema, "info");
createVirtualFields(ItemSchema, "size");
createVirtualFields(ItemSchema, "data");

// Định nghĩa schema chính
const ListPilotsSchema = new Schema({
  year: { type: String, unique: true },
  list: [ItemSchema],
});

const ListPilots = mongoose.model("ListPilots", ListPilotsSchema);

export default ListPilots;
