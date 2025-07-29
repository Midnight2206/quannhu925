import ListPilots from "../../configs/mongoDB/listPilots";
import fieldDisplayMappingPilots from "../../configs/mappingPilots";

class IndividualPilotsController {
    async render(req, res) {
        const {id} = req.params;
        try {
            // Lấy danh sách các năm từ MongoDB và sắp xếp tăng dần
            const years = (await ListPilots.distinct("year")).sort();

            // Lấy danh sách các key cho từng phần dữ liệu
            const infoKeys = Object.keys(ListPilots.schema.paths.list.schema.tree.info).filter(key => !key.includes('_'));
            const sizeKeys = Object.keys(ListPilots.schema.paths.list.schema.tree.size).filter(key => !key.includes('_'));
            const dataKeys = Object.keys(ListPilots.schema.paths.list.schema.tree.data).filter(key => !key.includes('_'));

            // Truy vấn dữ liệu theo ID
            const docs = await ListPilots.find(
                { "list.info.ID": id },
                { "list.$": 1, year: 1 }
            );

            if (!docs.length) {
                return res.status(404).json({ error: "Không tìm thấy dữ liệu với ID này" });
            }

            // Xử lý kết quả trả về
            let results = docs.flatMap(doc =>
                doc.list.map(item => ({ ...item._doc, year: doc.year }))
            );

            results.sort((a, b) => a.year - b.year);

            // Trả về kết quả
            res.status(200).json({ results, dataKeys, infoKeys, sizeKeys, years, fieldDisplayMappingPilots });
        } catch (error) {
            console.error("Lỗi truy vấn dữ liệu:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}

module.exports = new IndividualPilotsController();
