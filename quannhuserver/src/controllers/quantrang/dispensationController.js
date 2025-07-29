import Criterion from "../../configs/mongoDB/criterion";
import fieldDisplayMapping from "../../configs/mapping";
import Listquantrang from "../../configs/mongoDB/listquantrang";

class dispensationController {
    async render(req, res, next) {
        
        try {
            const CCD = req.query.CCD
            const year = req.query.year
            Criterion.findOne({year})
                .then (criterion => {
                    res.status(200).json({ data: criterion.data[CCD], fieldDisplayMapping})
                })
                .catch (next)
           
        } catch (error) {
            console.log(error)
        } 

    }
    async getQRCodeData(req, res, next) {
        try {
            const year = req.query.year
            const ID = req.query.ID
            Listquantrang.findOne({
                year,
                list: {
                  $elemMatch: {
                    "info.ID": ID
                  }
                }
              })
              .then(data => {
                if (data) {
                  // Sử dụng find để chỉ lấy phần tử có info.ID khớp
                  const matchingList = data.list.find(item => item.info.ID === ID);
            
                  res.json({ success: true, data: matchingList }); // Trả về phần tử khớp
                } else {
                  res.json({ success: false, message: 'Không tìm thấy dữ liệu phù hợp.' }); // Trả về thông báo nếu không tìm thấy
                }
              })
              .catch(error => {
                res.status(500).json({ success: false, message: 'Lỗi khi tìm dữ liệu.', error }); // Trả về lỗi nếu có
              });
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = new dispensationController()