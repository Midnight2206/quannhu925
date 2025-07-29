import * as crypto from "crypto";
import * as unorm from "unorm";
import ListPilots from "../../configs/mongoDB/listPilots.js";
import fieldDisplayMappingPilots from "../../configs/mappingPilots.js";

class ListPilotsController {
  async render(req, res, next) {
    const year = req.query.year;
    try {
      const doc = await ListPilots.findOne({year: year})
      const listDatas = doc.list
      const infoKeys = Object.keys(ListPilots.schema.paths.list.schema.tree.info).filter(item => !item.includes('_'))
      const infoHeaders = infoKeys.map(element => {
        return fieldDisplayMappingPilots[element]
      })
      const sizeKeys = Object.keys(ListPilots.schema.paths.list.schema.tree.size).filter(item => !item.includes('_'));
      const sizeHeaders = sizeKeys.map(element => {
        return fieldDisplayMappingPilots[element]
      })
      const dataKeys = Object.keys(ListPilots.schema.paths.list.schema.tree.data).filter(item => !item.includes('_'));
      const dataHeaders = dataKeys.map(element => {
        return fieldDisplayMappingPilots[element]
      })
      
      const years = await ListPilots.distinct('year')
      res
        .status(201)
        .json({infoKeys, sizeKeys, dataKeys, years, listDatas, dataHeaders, infoHeaders, sizeHeaders});
    } catch (error) {
      console.error("Lỗi khi thực hiện truy vấn:", error);
      res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    } 
  }
  async import(req, res) {
    try {
      const { data, year } = req.body;
      const listID = new Set();
      const errData = [];

      // Tạo ID duy nhất bằng SHA-256
      const setID = (fullName, CDD, type) =>
        crypto
          .createHash("sha256")
          .update(fullName + CDD + type)
          .digest("hex");

      // Lấy key của các phần tử từ Schema
      const {
        info,
        size,
        data: dataSchema,
      } = ListPilots.schema.paths.list.schema.tree;
      const infoKeys = Object.keys(info);
      const sizeKeys = Object.keys(size);
      const dataKeys = Object.keys(dataSchema);

      // Dữ liệu mới
      const newRecord = {
        year,
        list: [],
      };

      for (const dt of data) {
        const ID = setID(dt.fullName, dt.PHCDD, dt.type);

        if (listID.has(ID)) {
            console.log("Trùng ID:", ID);
          errData.push(dt); // Trùng ID => Lưu vào danh sách lỗi
        } else {
          listID.add(ID);
          const listItem = {
            info: {
              ...Object.fromEntries(infoKeys.map((k) => [k, dt[k]])),
              ID,
            },
            size: Object.fromEntries(sizeKeys.map((k) => [k, dt[k]])),
            data: Object.fromEntries(
              dataKeys.map((k) => [
                k,
                typeof dt[k] === "number" && !isNaN(dt[k]) ? dt[k] : 0,
              ])
            ),
          };
          newRecord.list.push(listItem);
        }
      }

      await ListPilots.create(newRecord);

      // Trả về danh sách lỗi (nếu có)
      res
        .status(200)
        .json(
          errData.length ? JSON.parse(unorm.nfc(JSON.stringify(errData))) : []
        );
    } catch (error) {
      console.error("Lỗi:", error);
      res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
  }
}
module.exports = new ListPilotsController();
