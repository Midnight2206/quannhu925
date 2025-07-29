import classNames from 'classnames/bind';
import { Table } from 'react-bootstrap';
import QRCode from 'react-qr-code';
import 'bootstrap/dist/css/bootstrap.min.css';
import removeAccents from 'remove-accents';
import style from './PhieuXuat.module.scss';

const cx = classNames.bind(style);

function PhieuXuat({ num, info, data, date, dispensationYear, fieldDisplayMapping, criterion, QRCodeData }) {
    let day, month, year;
    if (date) {
        day = date.getDate();
        month = date.getMonth() + 1;
        year = date.getFullYear();
    }
    const qrinfo = QRCodeData ? Object.entries(QRCodeData.info).map(([key, value]) => `${fieldDisplayMapping[key]}: ${value}`) : '';
    const qrsize = QRCodeData ? Object.entries(QRCodeData.size).map(([key, value]) => `${fieldDisplayMapping[key]}: ${value}`) : '';
    const qrdata = QRCodeData ? Object.entries(criterion).map(([key, value]) => `${fieldDisplayMapping[key]}: ${QRCodeData?.data[key]}/${value}`): '';
    
    const qrcode = removeAccents(
    `(Rieng cac dong chi la SQ, QNCN nu khong co tieu chuan day lung da)
    Thong tin: ${qrinfo}
    Co so: ${qrsize}
    So lieu: ${qrdata}
    `
    )
    console.log(qrcode);
    return (
        <div className={cx('invoice')}>
            <div className={cx('invoice-header')}>
                <div className={cx('invoice-title')}>
                    <div className={cx('left-title')}>
                        <p className={cx('top-para')}>SƯ ĐOÀN 372</p>
                        <p>
                            <strong>TRUNG ĐOÀN 925</strong>
                        </p>
                    </div>
                    <div className={cx('center-title')}>
                        <h3>
                            <strong>PHIẾU XUẤT KHO</strong>
                        </h3>
                        <p>
                            <i>
                                Ngày {day} tháng {month} năm {year}
                            </i>
                        </p>
                    </div>
                    <div className={cx('right-title')}>
                        <p>
                            <strong>Mẫu số C31-HD</strong>
                        </p>
                        <p>Số: {num}/QT</p>
                    </div>
                </div>
                {/* Phần thông tin người nhận */}
                <div className={cx('invoice-recipient-info')}>
                    <div className={cx('line-dup')}>
                        <p className={cx('line-left')}>Người nhận: {info.receiver}</p>
                        <p className={cx('line-right')}>Địa chỉ: {info.unit}</p>
                    </div>
                    <p>
                        Lý do: Cấp quân trang tiêu chuẩn năm {dispensationYear} cho đ/c {info.criterionOf}
                    </p>
                    <div className={cx('line-dup')}>
                        <p className={cx('line-left')}>Nhận tại kho: Quân trang</p>
                        <p className={cx('line-right')}>Địa điểm: Tiểu đoàn KTHCSB</p>
                    </div>
                    {/* Thêm thông tin khác nếu cần */}
                </div>
            </div>

            <div className={cx('invoice-table')}>
                {/* Phần chứa bảng thông tin */}
                <Table bordered>
                    <thead>
                        <tr>
                            <th rowSpan={'2'}>STT</th>
                            <th rowSpan={'2'}>Tên nhãn hiệu, quy cách, phẩm chất vật tư hàng hóa, dụng cụ</th>
                            <th rowSpan={'2'}>Đơn vị tính</th>
                            <th colSpan={'2'}>Số lượng</th>
                            <th rowSpan={'2'}>Đơn giá</th>
                            <th rowSpan={'2'}>Thành Tiền</th>
                        </tr>

                        <tr>
                            <th className={cx('special-col')}>Theo chứng từ</th>
                            <th>Thực nhận</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data).map(([key, value], index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className={cx('left-text')}>{fieldDisplayMapping[key]}</td>
                                    <td></td>
                                    <td>{value}</td>
                                    <td>{value}</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            <div className={cx('invoice-footer')}>
                {/* Phần chữ ký */}
                <div className={cx('invoice-signature')}>
                    <p>
                        <b>Người Lập Phiếu</b>
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <b>2/CN Trần Văn Tâm</b>
                    </p>
                    <p>
                        <b>Người Nhận</b>
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        {info.receiver}
                    </p>
                    <p>
                        <b>Trợ lý quân nhu</b>
                        <br />
                        <br />
                        <br />
                        <br />
                        <br />
                        <b>3/ Trần Văn Khánh</b>
                    </p>
                    <p>
                        <b>TL TRUNG ĐOÀN TRƯỞNG</b> <br></br>
                        <b>CHỦ NHIỆM HẬU CẦN</b>
                        <br />
                        <br />
                        <br />
                        <br />
                        <b>Trung tá Nguyễn Minh Tuấn</b>
                    </p>
                    {/* Thêm thông tin khác nếu cần */}
                </div>
            </div>
            <div className={cx('invoice-qr')}>
                <QRCode value={(qrcode)} size={100} />
            </div>
        </div>
    );
}

export default PhieuXuat;
