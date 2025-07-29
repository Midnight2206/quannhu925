import decreaseMilitaly from "../../configs/mongoDB/decreaseMilitaries";
import fieldDisplayMapping from "../../configs/mapping";
import Listquantrang from "../../configs/mongoDB/listquantrang";
import decreaseTemporarySave from "../../configs/mongoDB/decreaseTemporarySave";
import _ from "mongoose-sequence";

class decreaseController {
  async render(req, res) {
    try {
      const infoKeys = Object.keys(decreaseMilitaly.schema.tree.info).filter(
        (element) => element !== "ID"
      );
      const infoHeaders = infoKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const sizeKeys = Object.keys(decreaseMilitaly.schema.tree.size);
      const sizeHeaders = sizeKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const otherInfoKeys = Object.keys(decreaseMilitaly.schema.tree.otherInfo);
      const otherInfoHeaders = otherInfoKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      res
        .status(200)
        .json({
          infoKeys,
          sizeKeys,
          otherInfoKeys,
          infoHeaders,
          sizeHeaders,
          otherInfoHeaders,
        });
    } catch (error) {
      console.log(error);
    }
  }
  async decrease(req, res) {
    try {
      let { year, data } = req.body;
      if (!year || !data) {
        return res.status(400).json({ message: "Missing required fields" });
      } else {
        if (year === data.otherInfo.toAnyYear) {
          const listquantrang = await Listquantrang.findOne({ year: year });
          if (listquantrang) {
            const updatedData = listquantrang.list.filter(
              (item) => item.info.ID !== data.info.ID
            );
            listquantrang.list = updatedData;
            await listquantrang.save();
            const decreaseData = new decreaseMilitaly(data);
            await decreaseData.save();
            res.status(200).json({ message: `Quân nhân được giảm khỏi danh sách cấp phát năm ${year}` });
          } else {
            res.status(400).json({ message: `Lỗi dữ liệu` });
          }
        } else {
          const decreaseData = new decreaseMilitaly(data);
          await decreaseData.save();
          res.status(200).json({ message: `Quân nhân được thêm vào danh sách giảm không bảo đảm năm sau` });
        }
      }

    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async list(req, res) {
    try {
      const data = await decreaseMilitaly.find();
      const infoKeys = Object.keys(decreaseMilitaly.schema.tree.info).filter(
        (element) => element !== "ID"
      );
      const infoHeaders = infoKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const sizeKeys = Object.keys(decreaseMilitaly.schema.tree.size);
      const sizeHeaders = sizeKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const otherInfoKeys = Object.keys(decreaseMilitaly.schema.tree.otherInfo);
      const otherInfoHeaders = otherInfoKeys.map((element) => {
        return fieldDisplayMapping[element]; 
      });
      res
        .status(200)
        .json({
          infoKeys,
          sizeKeys,
          otherInfoKeys,
          infoHeaders,
          sizeHeaders,
          otherInfoHeaders,
          data,
        });
    } catch (error) {
        
    }
  }
  async temporarySave(req, res) {
    try {
      const data = req.body.data;

      // Tạo bản ghi mới từ dữ liệu nhận được
      const newRecord = new decreaseTemporarySave(data);
      await newRecord.save();

      res.status(200).json("Lưu tạm thành công");
    } catch (error) {
      console.error(error);
      res.status(500).json("Lỗi server");
    }
  }
  async getTemporarySaves(req, res) {
    try {
      const data = await decreaseTemporarySave.find();

      const schemaTree = decreaseTemporarySave.schema.tree;
      const extractHeaders = (field) => {
        const keys = schemaTree[field] ? Object.keys(schemaTree[field]) : [];
        const headers = keys.map((key) => fieldDisplayMapping[key] || key);
        return { keys, headers };
      };

      const info = extractHeaders("info");
      const size = extractHeaders("size");
      const otherInfo = extractHeaders("otherInfo");

      res.status(200).json({
        infoKeys: info.keys,
        sizeKeys: size.keys,
        otherInfoKeys: otherInfo.keys,
        infoHeaders: info.headers,
        sizeHeaders: size.headers,
        otherInfoHeaders: otherInfo.headers,
        data,
      });
    } catch (error) {
      console.error("Error in getTemporarySaves:", error);
      res.status(500).json({ error: "Lỗi server", details: error.message });
    }
  }
  async temporaryUpdate(req, res) {
    try {
      const { _id, changes } = req.body;
      console.log(_id, changes);
      if (!_id || !changes) {
        
        return res
          .status(400)
          .json({ message: "Thiếu _id hoặc dữ liệu thay đổi." });
          
      }
      // Lấy dữ liệu gốc từ database
      const existingData = await decreaseTemporarySave.findById(_id);
      if (!existingData) {
        return res
          .status(404)
          .json({ message: `${_id} + " không tồn tại trong database."` });
      }

      // Kết hợp dữ liệu gốc với thay đổi
      const updatedData = {
        info: { ...existingData.info, ...changes.info },
        size: { ...existingData.size, ...changes.size },
        otherInfo: { ...existingData.otherInfo, ...changes.otherInfo },
      };

      // Cập nhật trong database
      const updatedItem = await decreaseTemporarySave.findByIdAndUpdate(
        _id,
        { $set: updatedData },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        message: "Cập nhật thành công!",
        updatedItem,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật dữ liệu:", error);
      res
        .status(500)
        .json({ message: "Lỗi máy chủ, không thể cập nhật dữ liệu." });
    }
  }
  async temporaryRemove(req, res) {
      try {
        const { _id } = req.body;
  
        if (!_id) {
          return res.status(400).json({ error: "Missing _id" });
        }
  
        // Xóa tài liệu trong MongoDB bằng _id
        const result = await decreaseTemporarySave.findByIdAndDelete(_id);
  
        if (!result) {
          return res
            .status(404)
            .json({ error: "Không tìm thấy tài nguyên để xóa" });
        }
  
        return res.json({ message: "Xóa thành công", _id });
      } catch (error) {






        
        return res
          .status(500)
          .json({ error: "Đã xảy ra lỗi trong quá trình xóa" });
      }
    }
  async filter(req, res) {
    try {
        const { PHCDD, tranferTo, toAnyYear, dateMove, internalTransfer } = req.body.params;
        const query = {};

        if (PHCDD && PHCDD.length) {
            if (PHCDD.includes('<blank>')) {
                query['info.PHCDD'] = { $in: PHCDD.filter(item => item !== '<blank>').concat([null, undefined]) };
            } else {
                query['info.PHCDD'] = { $in: PHCDD };
            }
        }

        if (tranferTo && tranferTo.length) {
            if (tranferTo.includes('<blank>')) {
                query['otherInfo.tranferTo'] = { $in: tranferTo.filter(item => item !== '<blank>').concat([null, undefined]) };
            } else {
                query['otherInfo.tranferTo'] = { $in: tranferTo };
            }
        }
        if (toAnyYear && toAnyYear.length) {
            if (toAnyYear.includes('<blank>')) {
                query['otherInfo.toAnyYear'] = { $in: toAnyYear.filter(item => item !== '<blank>').concat([null, undefined]) };
            } else {
                query['otherInfo.toAnyYear'] = { $in: toAnyYear };
            }
        }
        if (dateMove && dateMove.length) {
            if (dateMove.includes('<blank>')) {
                query['otherInfo.dateMove'] = { $in: dateMove.filter(item => item !== '<blank>').concat([null, undefined]) };
            } else {
                query['otherInfo.dateMove'] = { $in: dateMove };
            }
        }
        if (internalTransfer && internalTransfer.length) {
            if (internalTransfer.includes('<blank>')) {
                query['otherInfo.internalTransfer'] = { $in: internalTransfer.filter(item => item !== '<blank>').concat([null, undefined]) };
            } else {
                query['otherInfo.internalTransfer'] = { $in: internalTransfer };
            }
        }

        // Thực hiện truy vấn lấy dữ liệu từ database
        const result = await decreaseMilitaly.find(query);

        // Gửi kết quả về cho client
        res.status(200).json({ data: result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
}
module.exports = new decreaseController();
