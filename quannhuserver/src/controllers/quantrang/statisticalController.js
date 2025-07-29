import Listquantrang from "../../configs/mongoDB/listquantrang";
import fieldDisplayMapping from "../../configs/mapping";
import Criterion from "../../configs/mongoDB/criterion";

class statisticalController {
  async render(req, res) {
    try {
      const year = req.query.year;
      const doc = await Listquantrang.findOne({ year: year });
      const criterion = await Criterion.findOne({ year });
      const dataKeys = Object.keys(
        Listquantrang.schema.paths.list.schema.tree.data
      ).filter((item) => !item.includes("_"));
      const listDatas = doc.list;
      let units;
      if (typeof listDatas === "object") {
        units = listDatas.reduce((acc, value) => {
          const unit = value.info.unit; // Lấy giá trị unit từ từng phần tử

          if (unit && !acc.includes(unit)) {
            // Nếu unit tồn tại và chưa có trong acc
            if (unit.includes("dHC")) {
              if (!acc.includes("dHC")) {
                acc.push("dHC"); // Chỉ thêm 'dHC' một lần
              }
            } else {
              acc.push(unit); // Thêm unit thông thường
            }
          }

          return acc;
        }, []);
      }
      units.push("trungDoan");
      let data = {};

      try {
        units.forEach((element) => {
          // Đảm bảo data[element] tồn tại và là một object
          if (!data[element]) {
            data[element] = {};
          }

          dataKeys.forEach((e) => {
            // Khởi tạo giá trị ban đầu là 0

            data[element][e] = {
              dispensation: 0,
              criterion: 0,
              percent: 0,
            };

            // Nếu element là 'trungDoan', đếm tổng số elem.data[e] trong listDatas
            if (element === "trungDoan") {
              listDatas.forEach((elem) => {
                try {
                  if (elem.data && elem.data[e]) {
                    data[element][e].dispensation++;
                  }
                  if (
                    elem.info &&
                    elem.info.PHCDD &&
                    criterion.data &&
                    criterion.data[elem.info.PHCDD][e]
                  ) {
                    data[element][e].criterion++;
                  }
                } catch (err) {
                  console.error(
                    `Error processing elem: ${JSON.stringify(elem)}, key: ${e}`,
                    err
                  );
                }
              });
            } else {
              // Với các element khác, kiểm tra thêm điều kiện elem.info.unit.includes(element)
              listDatas.forEach((elem) => {
                try {
                  if (
                    elem.data &&
                    elem.data[e] &&
                    elem.info &&
                    elem.info.unit &&
                    elem.info.unit.includes(element)
                  ) {
                    data[element][e].dispensation++;
                  }
                  if (
                    elem.info &&
                    elem.info.unit &&
                    elem.info.unit.includes(element) &&
                    criterion.data &&
                    criterion.data[elem.info.PHCDD][e]
                  ) {
                    data[element][e].criterion++;
                  }
                } catch (err) {
                  console.error(
                    `Error processing elem: ${JSON.stringify(elem)}, key: ${e}`,
                    err
                  );
                }
              });
            }
            if (data[element][e].criterion) {
                data[element][e].percent = (data[element][e].dispensation / data[element][e].criterion * 100).toFixed(2)
            }
          });
        });
      } catch (error) {
        console.error("An error occurred during processing:", error);
      }

      res.json({data, units, dataKeys, fieldDisplayMapping});
    } catch (error) {}
  }
}
module.exports = new statisticalController();
