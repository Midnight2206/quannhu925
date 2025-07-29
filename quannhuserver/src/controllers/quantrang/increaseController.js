import increaseMilitaries from "../../configs/mongoDB/increaseMilitaries";
import fieldDisplayMapping from "../../configs/mapping";
import Listquantrang from "../../configs/mongoDB/listquantrang";
import increaseTemporarySave from "../../configs/mongoDB/increaseTemporarySave";
import * as crypto from "crypto";
class increaseController {
  async render(req, res, next) {
    try {
      const data = await increaseMilitaries.find();
      const infoKeys = Object.keys(increaseMilitaries.schema.tree.info).filter(
        (element) => element !== "ID"
      );
      const infoHeaders = infoKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const sizeKeys = Object.keys(increaseMilitaries.schema.tree.size);
      const sizeHeaders = sizeKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const otherInfoKeys = Object.keys(
        increaseMilitaries.schema.tree.otherInfo
      );
      const otherInfoHeaders = otherInfoKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      res.status(200).json({
        infoKeys,
        sizeKeys,
        otherInfoKeys,
        infoHeaders,
        sizeHeaders,
        otherInfoHeaders,
        data,
      });
    } catch (error) {
      console.log(error);
    }
  }
  async increase(req, res, next) {
    try {
      const data = req.body.data;

      // Kiểm tra dữ liệu yêu cầu có tồn tại hay không
      if (!data || !data.info || !data.otherInfo) {
        return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
      }

      const year = data.otherInfo.fromAnyYear;

      // Kiểm tra năm có tồn tại hay không
      const exists = await Listquantrang.exists({ year: year });

      // Hàm tạo ID cho quân nhân
      const setID = (fullName, CDD, sex) => {
        if (!fullName || !CDD || !sex) {
          throw new Error("Thông tin không đầy đủ để tạo ID");
        }

        const inputString = fullName + CDD;
        const hash = crypto.createHash("sha256");
        hash.update(inputString);
        let sexId = sex === "Nam" ? 1 : 0;
        return hash.digest("hex") + sexId;
      };

      data.info.ID = setID(
        data.info.fullName,
        data.info.PHCDD,
        data.info.gender
      );

      if (exists) {
        const recoder = await Listquantrang.findOne({ year: year });

        if (!recoder) {
          return res
            .status(404)
            .json({ message: `Không tìm thấy bản ghi cho năm ${year}` });
        }

        const listID = recoder.list.map((item) => item.info.ID);

        if (listID.includes(data.info.ID)) {
          return res.status(500).json({
            message: `Đã có quân nhân trong danh sách năm ${year} cùng tên ${data.info.fullName}, giới tính ${data.info.gender}, năm PH CCĐ ${data.info.PHCDD}.`,
          });
        }

        await Listquantrang.updateOne(
          { year: year },
          { $push: { list: data } }
        );

        const newRecord = new increaseMilitaries(data);
        await newRecord.save();

        return res.status(200).json("Thành công");
      } else {
        // Nếu không có bản ghi cho năm, tạo bản ghi mới
        const newRecord = new increaseMilitaries(data);
        await newRecord.save();

        return res.status(200).json("Thành công");
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  }

  async list(req, res) {
    try {
      const data = await increaseMilitaries.find();
      const infoKeys = Object.keys(increaseMilitaries.schema.tree.info).filter(
        (element) => element !== "ID"
      );
      const infoHeaders = infoKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const sizeKeys = Object.keys(increaseMilitaries.schema.tree.size);
      const sizeHeaders = sizeKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      const otherInfoKeys = Object.keys(
        increaseMilitaries.schema.tree.otherInfo
      );
      const otherInfoHeaders = otherInfoKeys.map((element) => {
        return fieldDisplayMapping[element];
      });
      res.status(200).json({
        infoKeys,
        sizeKeys,
        otherInfoKeys,
        infoHeaders,
        sizeHeaders,
        otherInfoHeaders,
        data,
      });
    } catch (error) {}
  }
  async filter(req, res) {
    try {
      const { PHCDD, tranferFrom, moveInTime, fromAnyYear } = req.body.params;
      const query = {};

      if (PHCDD && PHCDD.length) {
        if (PHCDD.includes("<blank>")) {
          query["info.PHCDD"] = {
            $in: PHCDD.filter((item) => item !== "<blank>").concat([
              null,
              undefined,
            ]),
          };
        } else {
          query["info.PHCDD"] = { $in: PHCDD };
        }
      }
      if (tranferFrom && tranferFrom.length) {
        if (tranferFrom.includes("<blank>")) {
          query["otherInfo.tranferFrom"] = {
            $in: tranferFrom
              .filter((item) => item !== "<blank>")
              .concat([null, undefined]),
          };
        } else {
          query["otherInfo.tranferFrom"] = { $in: tranferFrom };
        }
      }
      if (moveInTime && moveInTime.length) {
        if (moveInTime.includes("<blank>")) {
          query["otherInfo.moveInTime"] = {
            $in: moveInTime
              .filter((item) => item !== "<blank>")
              .concat([null, undefined]),
          };
        } else {
          query["otherInfo.moveInTime"] = { $in: moveInTime };
        }
      }
      if (fromAnyYear && fromAnyYear.length) {
        if (fromAnyYear.includes("<blank>")) {
          query["otherInfo.fromAnyYear"] = {
            $in: fromAnyYear
              .filter((item) => item !== "<blank>")
              .concat([null, undefined]),
          };
        } else {
          query["otherInfo.fromAnyYear"] = { $in: fromAnyYear };
        }
      }
      // Thực hiện truy vấn lấy dữ liệu từ database
      const result = await increaseMilitaries.find(query);

      // Gửi kết quả về cho client
      res.status(200).json({ data: result });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
  async temporarySave(req, res) {
    try {
      const data = req.body.data;

      // Tạo bản ghi mới từ dữ liệu nhận được
      const newRecord = new increaseTemporarySave(data);
      await newRecord.save();

      res.status(200).json("Lưu tạm thành công");
    } catch (error) {
      console.error(error);
      res.status(500).json("Lỗi server");
    }
  }
  async getTemporarySaves(req, res) {
    try {
      const data = await increaseTemporarySave.find();

      const schemaTree = increaseTemporarySave.schema.tree;
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

      if (!_id || !changes) {
        return res
          .status(400)
          .json({ message: "Thiếu _id hoặc dữ liệu thay đổi." });
      }

      // Lấy dữ liệu gốc từ database
      const existingData = await increaseTemporarySave.findById(_id);
      if (!existingData) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy dữ liệu cần cập nhật." });
      }

      // Kết hợp dữ liệu gốc với thay đổi
      const updatedData = {
        info: { ...existingData.info, ...changes.info },
        size: { ...existingData.size, ...changes.size },
        otherInfo: { ...existingData.otherInfo, ...changes.otherInfo },
      };

      // Cập nhật trong database
      const updatedItem = await increaseTemporarySave.findByIdAndUpdate(
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
      const result = await increaseTemporarySave.findByIdAndDelete(_id);

      if (!result) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy tài nguyên để xóa" });
      }

      return res.json({ message: "Xóa thành công", _id });
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      return res
        .status(500)
        .json({ error: "Đã xảy ra lỗi trong quá trình xóa" });
    }
  }
}
module.exports = new increaseController();
